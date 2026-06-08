import { notificationsCol } from '../../core/database';
import { Notification } from '@drag-racing/shared/types';

export class NotificationsService {
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await notificationsCol.find({ userId }).sort({ createdAt: -1 }).toArray();
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await notificationsCol.countDocuments({ userId, read: false });
  }

  async markAsRead(userId: number, notifId: number) {
    await notificationsCol.updateOne({ id: notifId, userId }, { $set: { read: true } });
    return { success: true };
  }

  async markAllAsRead(userId: number) {
    await notificationsCol.updateMany({ userId }, { $set: { read: true } });
    return { success: true };
  }

  async createNotification(payload: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const lastNotif = await notificationsCol.find().sort({ id: -1 }).limit(1).toArray();
    const nextId = lastNotif.length > 0 ? lastNotif[0].id + 1 : 1;
    
    const newNotif: Notification = {
      ...payload,
      id: nextId,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    await notificationsCol.insertOne(newNotif);
    return newNotif;
  }
}

export const notificationsService = new NotificationsService();
