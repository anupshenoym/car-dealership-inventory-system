import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
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

// ─── Auth ────────────────────────────────────
export const authApi = {
  register: (email: string, password: string, role?: string) =>
    api.post('/auth/register', { email, password, role }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// ─── Vehicles ────────────────────────────────
export const vehicleApi = {
  list: (page = 1, limit = 12) =>
    api.get(`/vehicles?page=${page}&limit=${limit}`),
  search: (params: Record<string, string | number>) =>
    api.get('/vehicles/search', { params }),
  getById: (id: string) =>
    api.get(`/vehicles/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post('/vehicles', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/vehicles/${id}`, data),
  delete: (id: string) =>
    api.delete(`/vehicles/${id}`),
  purchase: (id: string) =>
    api.post(`/vehicles/${id}/purchase`),
  restock: (id: string, amount: number) =>
    api.post(`/vehicles/${id}/restock`, { amount }),
};

export default api;
