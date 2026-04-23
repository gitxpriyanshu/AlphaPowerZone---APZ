import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@config/axiosInstance';
import { Product } from '@typeDefs/product';

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
}

/**
 * Custom hook for fetching products with optional filters
 */
export const useProducts = (filters: any = {}) => {
  const { data, isLoading, error, refetch } = useQuery<ProductsResponse>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await axiosInstance.get<any>('/products', { params: filters });
      return response.data.data;
    },
  });

  return {
    products: data?.products || ([] as Product[]),
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch,
  };
};
