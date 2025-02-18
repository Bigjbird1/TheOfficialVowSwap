import prisma from '@/lib/prisma';
import { cache } from 'react';
import { io } from 'socket.io-client';

export type NotificationType = 
  | 'NEW_MESSAGE'
  | 'ORDER_UPDATE'
  | 'PROMOTION'
  | 'SYSTEM_ALERT'
  | 'PRICE_CHANGE'
  | 'INVENTORY_ALERT'
  | 'REVIEW'
  | 'BULK_REQUEST';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private static getSocket() {
    if (typeof window === 'undefined') return null;
    if (!this.socket) {
      this.socket = io({ path: '/api/socket' });
    }
    return this.socket;
  }

  private static socket: ReturnType<typeof io> | null = null;

  static async createNotification(data: NotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });

    // Emit real-time notification
    const socket = this.getSocket();
    socket?.emit('notification', {
      ...notification,
      data: data.data,
    });

    return notification;
  }

  static async createBulkNotifications(notifications: NotificationData[]) {
    const createdNotifications = await prisma.$transaction(
      notifications.map(notification =>
        prisma.notification.create({
          data: {
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
          },
        })
      )
    );

    // Emit real-time notifications
    const socket = this.getSocket();
    createdNotifications.forEach(notification => {
      const originalData = notifications.find(n => n.userId === notification.userId)?.data;
      socket?.emit('notification', {
        ...notification,
        data: originalData,
      });
    });

    return createdNotifications;
  }

  // Cache user's notifications for 1 minute
  static getUserNotifications = cache(async (userId: string, limit = 20) => {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return notifications;
  });

  static async markAsRead(notificationId: string) {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    return notification;
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  static async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  // Helper methods for common notifications
  static async sendOrderUpdateNotification(userId: string, orderId: string, status: string) {
    return this.createNotification({
      userId,
      type: 'ORDER_UPDATE',
      title: 'Order Status Update',
      message: `Your order #${orderId} is now ${status.toLowerCase()}`,
      link: `/orders/${orderId}`,
      data: { orderId, status },
    });
  }

  static async sendInventoryAlert(userId: string, productId: string, stockLevel: number) {
    return this.createNotification({
      userId,
      type: 'INVENTORY_ALERT',
      title: 'Low Stock Alert',
      message: `Product is running low on stock (${stockLevel} units remaining)`,
      link: `/seller/products/${productId}`,
      data: { productId, stockLevel },
    });
  }

  static async sendBulkRequestNotification(userId: string, requestId: string, status: string) {
    return this.createNotification({
      userId,
      type: 'BULK_REQUEST',
      title: 'Bulk Purchase Request Update',
      message: `Your bulk purchase request #${requestId} has been ${status.toLowerCase()}`,
      link: `/bulk-requests/${requestId}`,
      data: { requestId, status },
    });
  }

  static async sendPromotionalNotification(userIds: string[], title: string, message: string, link?: string) {
    const notifications = userIds.map(userId => ({
      userId,
      type: 'PROMOTION' as NotificationType,
      title,
      message,
      link,
    }));

    return this.createBulkNotifications(notifications);
  }
}
