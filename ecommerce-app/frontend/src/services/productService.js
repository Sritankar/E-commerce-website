import api from './api';

export const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    // Filter out empty/null/undefined parameters to prevent 422 errors
    const cleanParams = {};
    
    Object.entries(params).forEach(([key, value]) => {
      // Only include parameters that have actual values
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        cleanParams[key] = value;
      }
    });
    
    console.log('API Request - Clean params:', cleanParams); // Debug log
    
    try {
      const response = await api.get('/products', { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/products/categories/list');
    return response.data;
  },

  // Get brands
  getBrands: async () => {
    const response = await api.get('/products/brands/list');
    return response.data;
  },

  // Get product stats
  getProductStats: async () => {
    const response = await api.get('/products/stats/summary');
    return response.data;
  },
};
