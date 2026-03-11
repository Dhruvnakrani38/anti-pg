import api from './api';

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Public Services
export const publicService = {
  searchPGs: (params) => api.get('/public/pgs', { params }),
  getPGDetail: (id) => api.get(`/public/pgs/${id}`),
  getCities: () => api.get('/public/cities'),
  getFeatured: () => api.get('/public/featured'),
  getStats: () => api.get('/public/stats'),
  submitEnquiry: (data) => api.post('/public/enquiry', data),
};

// Owner Services
export const ownerService = {
  getDashboard: () => api.get('/owner/dashboard'),
  // PGs
  getMyPGs: () => api.get('/owner/pgs'),
  addPG: (formData) => api.post('/owner/pgs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePG: (id, formData) => api.put(`/owner/pgs/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePG: (id) => api.delete(`/owner/pgs/${id}`),
  togglePGStatus: (id) => api.patch(`/owner/pgs/${id}/toggle`),
  // Rooms
  getRooms: (pgId) => api.get(`/owner/pgs/${pgId}/rooms`),
  addRoom: (pgId, data) => api.post(`/owner/pgs/${pgId}/rooms`, data),
  updateRoom: (id, data) => api.put(`/owner/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/owner/rooms/${id}`),
  // Tenants
  getTenants: (params) => api.get('/owner/tenants', { params }),
  addTenant: (formData) => api.post('/owner/tenants', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateTenant: (id, data) => api.put(`/owner/tenants/${id}`, data),
  checkoutTenant: (id) => api.patch(`/owner/tenants/${id}/checkout`),
  // Finance
  getFinanceSummary: (params) => api.get('/owner/finance/summary', { params }),
  getPayments: (params) => api.get('/owner/payments', { params }),
  addPayment: (data) => api.post('/owner/payments', data),
  updatePayment: (id, data) => api.put(`/owner/payments/${id}`, data),
  getExpenses: (params) => api.get('/owner/expenses', { params }),
  addExpense: (data) => api.post('/owner/expenses', data),
  // Enquiries
  getEnquiries: () => api.get('/owner/enquiries'),
  markEnquiryRead: (id) => api.patch(`/owner/enquiries/${id}/read`),
};

// Admin Services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllPGs: (params) => api.get('/admin/pgs', { params }),
  updatePGStatus: (id, data) => api.put(`/admin/pgs/${id}/status`, data),
  deletePG: (id) => api.delete(`/admin/pgs/${id}`),
  getAllOwners: (params) => api.get('/admin/owners', { params }),
  toggleOwnerStatus: (id) => api.patch(`/admin/owners/${id}/toggle`),
  getAllTenants: (params) => api.get('/admin/tenants', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  getAllEnquiries: () => api.get('/admin/enquiries'),
};
