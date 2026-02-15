import { create } from 'zustand';
import { User, AuthTokens } from '../types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (tokens: AuthTokens, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  updateTokens: (tokens: Partial<AuthTokens>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: (tokens, user) => {
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateUser: (user) => {
    set({ user });
  },

  updateTokens: (tokens) => {
    set((state) => ({
      accessToken: tokens.accessToken ?? state.accessToken,
      refreshToken: tokens.refreshToken ?? state.refreshToken,
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
