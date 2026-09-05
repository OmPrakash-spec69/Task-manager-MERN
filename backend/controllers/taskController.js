const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Helper: builds a Mongoose sort object from a `sortBy` query param
const buildSort = (sortBy) => {
  switch (sortBy) {
    case 'oldest':
      return { createdAt: 1 };
    case 'priority': {
      // High -> Medium -> Low. Mongo can't sort enums by custom order
      // directly, so we sort in application code for this case (see below).
      return null;
    }
    case 'dueDate':
      return { dueDate: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

// @desc    Get all tasks for logged-in user (supports filter/search/sort)
// @route   GET /api/tasks?status=pending|completed|all&search=&sortBy=
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { status, search, sortBy } = req.query;

  const query = { user: req.user._id };

  if (status === 'pending') query.completed = false;
  if (status === 'completed') query.completed = true;

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ title: regex }, { description: regex }];
  }

  let tasks;
  const sort = buildSort(sortBy);

  if (sort) {
    tasks = await Task.find(query).sort(sort);
  } else {
    // priority sort - fetch then sort in memory (dataset is per-user, small)
    tasks = await Task.find(query);
    tasks.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
  }

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: { tasks },
  });
});

// @desc    Get task statistics for the logged-in user
// @route   GET /api/tasks/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  const [total, completed, pending, overdue] = await Promise.all([
    Task.countDocuments({ user: userId }),
    Task.countDocuments({ user: userId, completed: true }),
    Task.countDocuments({ user: userId, completed: false }),
    Task.countDocuments({
      user: userId,
      completed: false,
      dueDate: { $ne: null, $lt: now },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: { total, completed, pending, overdue },
  });
});

// @desc    Get a single task by ID (must belong to logged-in user)
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to access this task');
  }

  res.status(200).json({ success: true, data: { task } });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, completed } = req.body;

  const task = await Task.create({
    title,
    description,
    priority,
    dueDate: dueDate || null,
    completed: completed || false,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  });
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (owner only)
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this task');
  }

  const { title, description, priority, dueDate, completed } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (completed !== undefined) task.completed = completed;

  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task },
  });
});

// @desc    Toggle a task's completed status
// @route   PATCH /api/tasks/:id/toggle
// @access  Private (owner only)
const toggleTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to modify this task');
  }

  task.completed = !task.completed;
  await task.save();

  res.status(200).json({
    success: true,
    message: `Task marked as ${task.completed ? 'completed' : 'pending'}`,
    data: { task },
  });
});

// @desc    Delete a single task
// @route   DELETE /api/tasks/:id
// @access  Private (owner only)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this task');
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

// @desc    Delete all completed tasks for logged-in user
// @route   DELETE /api/tasks/completed/all
// @access  Private
const deleteCompletedTasks = asyncHandler(async (req, res) => {
  const result = await Task.deleteMany({ user: req.user._id, completed: true });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} completed task(s) deleted`,
    data: { deletedCount: result.deletedCount },
  });
});

module.exports = {
  getTasks,
  getStats,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  deleteCompletedTasks,
};
