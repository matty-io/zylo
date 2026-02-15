import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { extractData } from '../client';
import { PaymentInitiateResponse } from '../../types';

export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiClient.post<{ data: PaymentInitiateResponse }>(
        `/payments/initiate?bookingId=${bookingId}`
      );
      return extractData(response);
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      paymentId,
      signature,
    }: {
      orderId: string;
      paymentId: string;
      signature?: string;
    }) => {
      const response = await apiClient.post<{ data: { success: boolean; bookingId: string } }>(
        '/payments/verify',
        { orderId, paymentId, signature }
      );
      return extractData(response);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.bookingId] });
    },
  });
}
