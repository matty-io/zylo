import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { extractData } from '../client';
import { useAuthStore } from '../../store/authStore';
import { ApiResponse, User } from '../../types';

export function useProfile() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>('/users/me');
      return extractData(response);
    },
    enabled: isAuthenticated,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: { name?: string; city?: string; preferredSports?: string[] }) => {
      const response = await apiClient.put<ApiResponse<User>>('/users/me', data);
      return extractData(response);
    },
    onSuccess: (data) => {
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

export function useUpdateFcmToken() {
  return useMutation({
    mutationFn: async (fcmToken: string) => {
      await apiClient.put('/users/me/fcm-token', { fcmToken });
    },
  });
}
