import api from './api';

export const departmentService = {
  // Get all departments
  getDepartments: async (params = {}) => {
    const response = await api.get('/departments', { params });
    return response.data;
  },

  // Get single department
  getDepartment: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Get department products
  getDepartmentProducts: async (id, params = {}) => {
    const response = await api.get(`/departments/${id}/products`, { params });
    return response.data;
  },

  // Create department
  createDepartment: async (departmentData) => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id, force = false) => {
    const response = await api.delete(`/departments/${id}`, {
      params: { force }
    });
    return response.data;
  },

  // Get department stats
  getDepartmentStats: async () => {
    const response = await api.get('/departments/stats/summary');
    return response.data;
  },
};
