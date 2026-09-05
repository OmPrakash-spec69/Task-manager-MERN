import api from './axios';

export const fetchTasks = ({ status, search, sortBy } = {}) => {
  const params = {};
  if (status && status !== 'all') params.status = status;
  if (search) params.search = search;
  if (sortBy) params.sortBy = sortBy;
  return api.get('/tasks', { params }).then((res) => res.data.data.tasks);
};

export const fetchStats = () =>
  api.get('/tasks/stats').then((res) => res.data.data);

export const createTask = (payload) =>
  api.post('/tasks', payload).then((res) => res.data.data.task);

export const updateTask = (id, payload) =>
  api.put(`/tasks/${id}`, payload).then((res) => res.data.data.task);

export const toggleTask = (id) =>
  api.patch(`/tasks/${id}/toggle`).then((res) => res.data.data.task);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then((res) => res.data);

export const deleteCompletedTasks = () =>
  api.delete('/tasks/completed/all').then((res) => res.data.data);
