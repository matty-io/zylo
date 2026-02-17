import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '../client';
import { ApiResponse, Booking, Page } from '../../types';
import { useBookingStore } from '../../store/bookingStore';

export function useMyBookings() {
  return useInfiniteQuery({
    queryKey: ['bookings', 'my'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<ApiResponse<Page<Booking>>>(
        `/bookings?page=${pageParam}&size=20`
      );
      return extractData(response);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });
}

export function useBookingDetails(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
      return extractData(response);
    },
    enabled: !!bookingId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { clearSelection } = useBookingStore();

  return useMutation({
    mutationFn: async ({ slotId, idempotencyKey }: { slotId: string; idempotencyKey: string }) => {
      const response = await apiClient.post<ApiResponse<Booking>>('/bookings', {
        slotId,
        idempotencyKey,
      });
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      clearSelection();
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      const response = await apiClient.post<ApiResponse<Booking>>(`/bookings/${bookingId}/cancel`, {
        reason,
      });
      return extractData(response);
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });
}
