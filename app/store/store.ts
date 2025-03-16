import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/models/auth';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
};

type LoadingState = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

type AppState = AuthState & LoadingState;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
      
      // Loading state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 