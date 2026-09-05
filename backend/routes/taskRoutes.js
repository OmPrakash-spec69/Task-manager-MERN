const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getTasks,
  getStats,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  deleteCompletedTasks,
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require a valid JWT
router.use(protect);

const taskRules = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional({ checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('priority').optional().isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601()
    .withMessage('Due date must be a valid date'),
  body('completed').optional().isBoolean().withMessage('Completed must be true or false'),
];

const updateTaskRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional({ checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('priority').optional().isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601()
    .withMessage('Due date must be a valid date'),
  body('completed').optional().isBoolean().withMessage('Completed must be true or false'),
];

const idRule = [param('id').isMongoId().withMessage('Invalid task id')];

// Stats & bulk delete must be declared before the generic '/:id' route
router.get('/stats', getStats);
router.delete('/completed/all', deleteCompletedTasks);

router.route('/')
  .get(getTasks)
  .post(taskRules, validate, createTask);

router.route('/:id')
  .get(idRule, validate, getTaskById)
  .put(idRule, updateTaskRules, validate, updateTask)
  .delete(idRule, validate, deleteTask);

router.patch('/:id/toggle', idRule, validate, toggleTask);

module.exports = router;
