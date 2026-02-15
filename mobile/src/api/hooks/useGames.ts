import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '../client';
import { GameListItem, GameDetail, Page } from '../../types';

interface GameFilters {
  sport?: string;
  city?: string;
}

export function usePublicGames(filters?: GameFilters) {
  return useInfiniteQuery({
    queryKey: ['games', 'public', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.append('page', pageParam.toString());
      params.append('size', '20');
      if (filters?.sport) params.append('sport', filters.sport);
      if (filters?.city) params.append('city', filters.city);

      const response = await apiClient.get<{ data: Page<GameListItem> }>(
        `/games?${params.toString()}`
      );
      return extractData(response);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });
}

export function useMyGames() {
  return useInfiniteQuery({
    queryKey: ['games', 'my'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<{ data: Page<GameListItem> }>(
        `/games/my?page=${pageParam}&size=20`
      );
      return extractData(response);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });
}

export function useGameDetails(gameId: string) {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: GameDetail }>(`/games/${gameId}`);
      return extractData(response);
    },
    enabled: !!gameId,
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      bookingId: string;
      title: string;
      maxPlayers: number;
      skillLevel?: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      const response = await apiClient.post<{ data: GameDetail }>('/games', data);
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useJoinGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const response = await apiClient.post<{ data: GameDetail }>(`/games/${gameId}/join`);
      return extractData(response);
    },
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
  });
}

export function useLeaveGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const response = await apiClient.post<{ data: GameDetail }>(`/games/${gameId}/leave`);
      return extractData(response);
    },
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
  });
}
