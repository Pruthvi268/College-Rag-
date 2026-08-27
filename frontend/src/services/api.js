import axios from 'axios';

// Use VITE_API_URL in production or fallback to /api for local dev proxy
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer Token if available in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('collegerag_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthenticated globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if needed
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role = 'STUDENT') =>
    api.post('/auth/register', { name, email, password, role }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Chat Services
export const chatApi = {
  ask: (question, conversationId = null, category = null, department = null) =>
    api.post('/chat', {
      question,
      conversation_id: conversationId,
      category,
      department,
    }),
  getConversations: () => api.get('/chat/conversations'),
  getConversation: (id) => api.get(`/chat/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/chat/conversations/${id}`),
};

// Document Management Services (Admin & Read)
export const documentApi = {
  list: (category = null, department = null) =>
    api.get('/documents', { params: { category, department } }),
  get: (id) => api.get(`/documents/${id}`),
  getChunks: (id) => api.get(`/documents/${id}/chunks`),
  upload: (formData) =>
    api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/documents/${id}`, data),
  reprocess: (id) => api.post(`/documents/${id}/reprocess`),
  delete: (id) => api.delete(`/documents/${id}`),
};

// Admin Services
export const adminApi = {
  getStats: () => api.get('/admin/dashboard'),
  getUnanswered: () => api.get('/admin/unanswered'),
};

// Feedback Services
export const feedbackApi = {
  submit: (messageId, rating, comment = '') =>
    api.post('/feedback', {
      message_id: messageId,
      rating,
      comment,
    }),
};

export default api;
