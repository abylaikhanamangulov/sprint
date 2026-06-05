import { create } from 'zustand';
import { api } from './api';
import { getErrorMessage } from './errors';
import type { User, MyCar, Notification, TelegramLoginData, PendingWar } from './types';

export type ScreenId =
  | 'hub'
  | 'garage'
  | 'race'
  | 'campaign'
  | 'events'
  | 'clan'
  | 'shop'
  | 'profile'
  | 'settings'
  | 'notifications';

interface GameState {
  user: User | null;
  isNew: boolean;
  loading: boolean;
  error: string | null;
  myCars: MyCar[];
  selectedScreen: ScreenId;
  notifications: Notification[];
  unreadCount: number;
  pendingWar: PendingWar | null;

  login: (telegramData: TelegramLoginData) => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchMyCars: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  setScreen: (screen: ScreenId) => void;
  updateUser: (partial: Partial<User>) => void;
  setError: (error: string | null) => void;
  setPendingWar: (war: PendingWar | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  user: null,
  isNew: false,
  loading: true,
  error: null,
  myCars: [],
  selectedScreen: 'hub',
  notifications: [],
  unreadCount: 0,
  pendingWar: null,

  login: async (telegramData) => {
    try {
      set({ loading: true, error: null });
      const { user, isNew } = await api.auth.login(telegramData);
      set({ user, isNew, loading: false });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e), loading: false });
    }
  },

  fetchUser: async () => {
    try {
      const user = await api.auth.me();
      set({ user });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
    }
  },

  fetchMyCars: async () => {
    try {
      const myCars = await api.garage.myCars();
      set({ myCars });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
    }
  },

  fetchNotifications: async () => {
    try {
      const [notifications, { count }] = await Promise.all([
        api.notifications.list(),
        api.notifications.unreadCount(),
      ]);
      set({ notifications, unreadCount: count });
    } catch {
      // Notifications are non-critical; ignore transient failures.
    }
  },

  setScreen: (screen) => set({ selectedScreen: screen }),
  updateUser: (partial) =>
    set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
  setError: (error) => set({ error }),
  setPendingWar: (war) => set({ pendingWar: war }),
}));
