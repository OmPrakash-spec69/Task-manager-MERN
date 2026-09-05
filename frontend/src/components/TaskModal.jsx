import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { validateTaskForm } from '../utils/validators';
import { toInputDate } from '../utils/date';

const emptyForm = { title: '', description: '', priority: 'Medium', dueDate: '', completed: false };

const TaskModal = ({ task, onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        dueDate: toInputDate(task.dueDate),
        completed: task.completed || false,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [task]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateTaskForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'New Task'}</h3>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Close">
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Finish project proposal"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={errors.title ? 'has-error' : ''}
              autoFocus
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Optional details about this task..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </div>
          </div>

          {task && (
            <div className="field">
              <label htmlFor="completed">Status</label>
              <select
                id="completed"
                value={form.completed ? 'true' : 'false'}
                onChange={(e) => handleChange('completed', e.target.value === 'true')}
              >
                <option value="false">Pending</option>
                <option value="true">Completed</option>
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner" /> : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
