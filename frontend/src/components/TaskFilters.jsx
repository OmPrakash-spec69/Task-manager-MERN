import { FiSearch } from 'react-icons/fi';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due date' },
];

const TaskFilters = ({ status, onStatusChange, search, onSearchChange, sortBy, onSortChange }) => {
  return (
    <div className="toolbar">
      <div className="search-box">
        <FiSearch className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Search tasks by title or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-btn ${status === opt.value ? 'active' : ''}`}
            onClick={() => onStatusChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>

      <select className="sort-select" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TaskFilters;
