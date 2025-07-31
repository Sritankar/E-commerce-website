import { useQuery, useMutation, useQueryClient } from 'react-query';
import { departmentService } from '../services/departmentService';
import { toast } from 'react-toastify';

export const useDepartments = (params = {}) => {
  return useQuery(
    ['departments', params],
    () => departmentService.getDepartments(params),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useDepartment = (id) => {
  return useQuery(
    ['department', id],
    () => departmentService.getDepartment(id),
    {
      enabled: !!id,
    }
  );
};

export const useDepartmentProducts = (id, params = {}) => {
  return useQuery(
    ['departmentProducts', id, params],
    () => departmentService.getDepartmentProducts(id, params),
    {
      enabled: !!id,
      keepPreviousData: true,
    }
  );
};

export const useDepartmentStats = () => {
  return useQuery(
    'departmentStats',
    departmentService.getDepartmentStats,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation(
    departmentService.createDepartment,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments');
        toast.success('Department created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to create department');
      },
    }
  );
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) => departmentService.updateDepartment(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['department', variables.id]);
        queryClient.invalidateQueries('departments');
        toast.success('Department updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update department');
      },
    }
  );
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, force }) => departmentService.deleteDepartment(id, force),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments');
        toast.success('Department deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to delete department');
      },
    }
  );
};
