import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiInbox } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StatsPanel from '../components/StatsPanel';
import TaskFilters from '../components/TaskFilters';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  fetchTasks,
  fetchStats,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  toggleTask as apiToggleTask,
  deleteTask as apiDeleteTask,
  deleteCompletedTasks as apiDeleteCompleted,
} from '../api/tasks';
import { getApiErrorMessage } from '../utils/validators';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);

  // Debounce the search input to avoid a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await fetchStats();
      setStats(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const data = await fetchTasks({ status, search: debouncedSearch, sortBy });
      setTasks(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoadingTasks(false);
    }
  }, [status, debouncedSearch, sortBy]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmitTask = async (payload) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await apiUpdateTask(editingTask._id, payload);
        toast.success('Task updated');
      } else {
        await apiCreateTask(payload);
        toast.success('Task created');
      }
      setModalOpen(false);
      setEditingTask(null);
      await Promise.all([loadTasks(), loadStats()]);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task) => {
    setBusyTaskId(task._id);
    // optimistic update
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, completed: !t.completed } : t)));
    try {
      await apiToggleTask(task._id);
      await loadStats();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      loadTasks(); // revert on failure
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleDeleteRequest = (task) => setTaskToDelete(task);

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await apiDeleteTask(taskToDelete._id);
      toast.success('Task deleted');
      setTaskToDelete(null);
      await Promise.all([loadTasks(), loadStats()]);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const handleClearCompleted = async () => {
    setDeleting(true);
    try {
      const result = await apiDeleteCompleted();
      toast.success(`${result.deletedCount} completed task(s) removed`);
      setConfirmClearOpen(false);
      await Promise.all([loadTasks(), loadStats()]);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const hasCompleted = stats?.completed > 0;

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container" style={{ flex: 1, paddingBottom: 40 }}>
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>My Tasks</h2>
            <p>Organize, track, and complete your work efficiently.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {hasCompleted && (
              <button className="btn btn-outline" onClick={() => setConfirmClearOpen(true)}>
                <FiTrash2 size={14} /> Clear Completed
              </button>
            )}
            <button className="btn" onClick={handleOpenCreate}>
              <FiPlus size={16} /> New Task
            </button>
          </div>
        </div>

        <StatsPanel stats={stats} loading={loadingStats} />

        <TaskFilters
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {loadingTasks ? (
          <div className="task-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiInbox />
            </div>
            <h3>No tasks found</h3>
            <p>
              {search || status !== 'all'
                ? 'Try adjusting your filters or search term.'
                : 'Create your first task to get started.'}
            </p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteRequest}
                isBusy={busyTaskId === task._id}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
          onSubmit={handleSubmitTask}
          isSubmitting={submitting}
        />
      )}

      {taskToDelete && (
        <ConfirmModal
          title="Delete task?"
          message={`This will permanently delete "${taskToDelete.title}". This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setTaskToDelete(null)}
          isSubmitting={deleting}
        />
      )}

      {confirmClearOpen && (
        <ConfirmModal
          title="Clear all completed tasks?"
          message={`This will permanently delete all ${stats?.completed || 0} completed task(s). This action cannot be undone.`}
          confirmLabel="Clear All"
          onConfirm={handleClearCompleted}
          onCancel={() => setConfirmClearOpen(false)}
          isSubmitting={deleting}
        />
      )}
    </div>
  );
};

export default Dashboard;
