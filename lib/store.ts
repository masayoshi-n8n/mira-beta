'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
}

interface AppState {
  _hasHydrated: boolean;
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  user: User | null;
  selectedNodeId: string | null;
  isUploadModalOpen: boolean;
  notificationCount: number;
  currentChatSessionId: string | null;
  preloadedPrompt: string | null;
  sidebarCollapsed: boolean;

  setHasHydrated: (v: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  setSelectedNode: (id: string | null) => void;
  setUploadModalOpen: (open: boolean) => void;
  setCurrentChatSession: (id: string | null) => void;
  setPreloadedPrompt: (prompt: string | null) => void;
  decrementNotifications: () => void;
  resetNotifications: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      isLoggedIn: false,
      hasCompletedOnboarding: false,
      user: null,
      selectedNodeId: null,
      isUploadModalOpen: false,
      notificationCount: 3,
      currentChatSessionId: null,
      preloadedPrompt: null,
      sidebarCollapsed: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),
      login: (user) => set({ isLoggedIn: true, user }),
      logout: () =>
        set({ isLoggedIn: false, user: null, hasCompletedOnboarding: false }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setSelectedNode: (id) => set({ selectedNodeId: id }),
      setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
      setCurrentChatSession: (id) => set({ currentChatSessionId: id }),
      setPreloadedPrompt: (prompt) => set({ preloadedPrompt: prompt }),
      decrementNotifications: () =>
        set((s) => ({ notificationCount: Math.max(0, s.notificationCount - 1) })),
      resetNotifications: () => set({ notificationCount: 0 }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'mira-app-state',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        user: state.user,
        notificationCount: state.notificationCount,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
