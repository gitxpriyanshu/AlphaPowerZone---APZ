import axiosInstance from '@config/axiosInstance';
import { Product } from '@typeDefs/product';

/**
 * Service for product related API calls
 */
export const productService = {
  /**
   * Fetch all products with filters
   */
  getAll: async (params: any = {}) => {
    const response = await axiosInstance.get<Product[]>('/products', { params });
    return response.data;
  },

  /**
   * Fetch a single product by ID
   */
  getById: async (id: string) => {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product (Admin only)
   */
  create: async (data: Partial<Product>) => {
    const response = await axiosInstance.post<Product>('/products', data);
    return response.data;
  },

  /**
   * Update an existing product (Admin only)
   */
  update: async (id: string, data: Partial<Product>) => {
    const response = await axiosInstance.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete a product (Admin only)
   */
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },
};
