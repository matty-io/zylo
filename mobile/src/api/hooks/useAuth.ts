import { useMutation } from '@tanstack/react-query';
import apiClient, { extractData } from '../client';
import { useAuthStore } from '../../store/authStore';
import { ApiResponse, AuthResponse } from '../../types';

export function useRequestOtp() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiClient.post('/auth/otp/request', { phone });
      return extractData(response);
    },
  });
}

export function useVerifyOtp() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/otp/verify', {
        phone,
        otp,
      });
      return extractData(response);
    },
    onSuccess: (data) => {
      login(
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        },
        data.user
      );
    },
  });
}

export function useLogout() {
  const { logout, refreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout', { refreshToken });
    },
    onSettled: () => {
      logout();
    },
  });
}
