import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productService } from '../services/productService';
import { toast } from 'react-toastify';

export const useProducts = (params = {}) => {
  return useQuery(
    ['products', params],
    () => productService.getProducts(params),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

export const useProduct = (id) => {
  return useQuery(
    ['product', id],
    () => productService.getProduct(id),
    {
      enabled: !!id,
    }
  );
};

export const useCategories = () => {
  return useQuery(
    'categories',
    productService.getCategories,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export const useBrands = () => {
  return useQuery(
    'brands',
    productService.getBrands,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export const useProductStats = () => {
  return useQuery(
    'productStats',
    productService.getProductStats,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    productService.createProduct,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to create product');
      },
    }
  );
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) => productService.updateProduct(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['product', variables.id]);
        queryClient.invalidateQueries('products');
        toast.success('Product updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update product');
      },
    }
  );
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    productService.deleteProduct,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to delete product');
      },
    }
  );
};
