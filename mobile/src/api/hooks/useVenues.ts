import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '../client';
import { ApiResponse, VenueListItem, VenueDetail, SlotsByCourt, Page } from '../../types';

interface VenueFilters {
  city?: string;
  sport?: string;
}

export function useVenues(filters?: VenueFilters) {
  return useInfiniteQuery({
    queryKey: ['venues', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.append('page', pageParam.toString());
      params.append('size', '20');
      if (filters?.city) params.append('city', filters.city);
      if (filters?.sport) params.append('sport', filters.sport);

      const response = await apiClient.get<ApiResponse<Page<VenueListItem>>>(
        `/venues?${params.toString()}`
      );
      return extractData(response);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });
}

export function useNearbyVenues(lat: number, lng: number, radiusKm = 10) {
  return useQuery({
    queryKey: ['venues', 'nearby', lat, lng, radiusKm],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<VenueListItem[]>>(
        `/venues/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`
      );
      return extractData(response);
    },
    enabled: lat !== 0 && lng !== 0,
  });
}

export function useVenueDetails(venueId: string) {
  return useQuery({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<VenueDetail>>(`/venues/${venueId}`);
      return extractData(response);
    },
    enabled: !!venueId,
  });
}

export function useVenueSlots(venueId: string, date: string) {
  return useQuery({
    queryKey: ['venue', venueId, 'slots', date],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SlotsByCourt[]>>(
        `/venues/${venueId}/slots?date=${date}`
      );
      return extractData(response);
    },
    enabled: !!venueId && !!date,
  });
}
