import { dataStore, FILES } from '../../core/database';
import { Notification } from '@drag-racing/shared/types';

export class NotificationsService {
  getUserNotifications(userId: number): Notification[] {
    const notifications = dataStore.get(FILES.NOTIFICATIONS);
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getUnreadCount(userId: number): number {
    const notifications = dataStore.get(FILES.NOTIFICATIONS);
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }

  markAsRead(userId: number, notifId: number) {
    dataStore.update(FILES.NOTIFICATIONS, notifications =>
      notifications.map(n => 
        n.id === notifId && n.userId === userId ? { ...n, read: true } : n
      )
    );
    return { success: true };
  }

  markAllAsRead(userId: number) {
    dataStore.update(FILES.NOTIFICATIONS, notifications =>
      notifications.map(n => 
        n.userId === userId ? { ...n, read: true } : n
      )
    );
    return { success: true };
  }

  createNotification(payload: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    dataStore.update(FILES.NOTIFICATIONS, notifications => {
      const nextId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
      const newNotif: Notification = {
        ...payload,
        id: nextId,
        read: false,
        createdAt: new Date().toISOString()
      };
      return [...notifications, newNotif];
    });
  }
}

export const notificationsService = new NotificationsService();
