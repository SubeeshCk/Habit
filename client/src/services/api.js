import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (userData) => api.post('/auth/login', userData),
  getMe: () => api.get('/auth/me')
};

// Routine API
export const routineAPI = {
  getAll: () => api.get('/routines'),
  create: (routineData) => api.post('/routines', routineData),
  update: (id, routineData) => api.put(`/routines/${id}`, routineData),
  delete: (id) => api.delete(`/routines/${id}`),
  completeTask: (routineId, taskId, date) =>
    api.patch(`/routines/${routineId}/tasks/${taskId}/complete`, { date }),
  uncompleteTask: (routineId, taskId, date) =>
    api.patch(`/routines/${routineId}/tasks/${taskId}/uncomplete`, { date })
};

export const todoAPI = {
  getAll: () => api.get('/todos'),
  create: (data) => api.post('/todos', data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  delete: (id) => api.delete(`/todos/${id}`),
};


export default api;
