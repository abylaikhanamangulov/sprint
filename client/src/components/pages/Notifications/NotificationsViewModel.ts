import { useEffect, useState } from 'react';
import { api } from 'src/models/api';
import { useGameStore } from 'src/models/store';
import type { Notification } from 'src/models/types';

interface NotificationsViewModel {
  notifications: Notification[];
  loading: boolean;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  close: () => void;
}

export function useNotificationsViewModel(): NotificationsViewModel {
  const { setScreen, fetchNotifications } = useGameStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.notifications.list().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const markRead = async (id: number) => {
    await api.notifications.read(id);
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.notifications.readAll();
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    fetchNotifications();
  };

  return { notifications, loading, markRead, markAllRead, close: () => setScreen('hub') };
}
