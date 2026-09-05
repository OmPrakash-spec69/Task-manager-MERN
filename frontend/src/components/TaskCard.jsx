import { FiCheck, FiEdit2, FiTrash2, FiCalendar, FiClock } from 'react-icons/fi';
import { formatDate, isOverdue } from '../utils/date';

const TaskCard = ({ task, onToggle, onEdit, onDelete, isBusy }) => {
  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <button
        className={`checkbox-btn ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task)}
        aria-label="Toggle completion"
        disabled={isBusy}
        type="button"
      >
        {task.completed && <FiCheck size={13} strokeWidth={3} />}
      </button>

      <div className="task-body">
        <div className="task-top-row">
          <span className="task-title">{task.title}</span>
          <span className={`priority-badge priority-${task.priority}`}>
            <span className="dot" />
            {task.priority}
          </span>
        </div>

        {task.description && <p className="task-desc">{task.description}</p>}

        <div className="task-meta">
          {task.dueDate && (
            <span className={`meta-item ${overdue ? 'overdue' : ''}`}>
              <FiCalendar size={13} />
              {formatDate(task.dueDate)}
              {overdue && ' · Overdue'}
            </span>
          )}
          <span className="meta-item">
            <FiClock size={13} />
            Added {formatDate(task.createdAt)}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task" type="button">
          <FiEdit2 size={14} />
        </button>
        <button
          className="icon-btn"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
          type="button"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
