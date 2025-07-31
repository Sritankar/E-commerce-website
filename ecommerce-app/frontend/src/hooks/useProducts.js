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
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      onError: (error) => {
        console.error('Products query error:', error);
        if (error?.response?.status === 422) {
          console.error('Validation error details:', error.response.data);
        }
      }
    }
  );
};

export const useProduct = (id) => {
  return useQuery(
    ['product', id],
    () => productService.getProduct(id),
    {
      enabled: !!id,
      retry: (failureCount, error) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 3;
      }
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
