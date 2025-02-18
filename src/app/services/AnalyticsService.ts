import prisma from '@/lib/prisma';
import { cache } from 'react';
import { OrderAnalytics, UserEngagementMetrics, ServiceAnalytics } from '@/types/prisma';
import { Prisma } from '@prisma/client';

export class AnalyticsService {
  private static orderSelect = {
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  } as const;
  // Cache seller analytics for 5 minutes
  static getSalesAnalytics = cache(async (sellerId: string, period: 'day' | 'week' | 'month' = 'week') => {
    const periodStart = new Date();
    switch (period) {
      case 'day':
        periodStart.setDate(periodStart.getDate() - 1);
        break;
      case 'week':
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
    }

    const analytics = await prisma.$transaction(async (tx) => {
      // Get total sales
      const orders = await tx.order.findMany({
        where: {
          createdAt: {
            gte: periodStart,
          },
          status: {
            in: ['PROCESSING', 'SHIPPED', 'DELIVERED'],
          },
        },
        ...this.orderSelect,
      });

      // Get user engagement metrics
      const userEngagement = await tx.userEngagement.findMany({
        where: {
          lastActive: {
            gte: periodStart,
          },
        },
      });

      // Get product views
      const productViews = await tx.productView.findMany({
        where: {
          createdAt: {
            gte: periodStart,
          },
        },
      });

      const analytics: OrderAnalytics = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((acc, order) => acc + order.total, 0),
        averageOrderValue: orders.length > 0 
          ? orders.reduce((acc, order) => acc + order.total, 0) / orders.length 
          : 0,
        activeUsers: userEngagement.length,
        productViews: productViews.length,
        conversionRate: productViews.length > 0 
          ? (orders.length / productViews.length) * 100 
          : 0,
      };
    });

    return analytics;
  });

  // Cache user engagement metrics for 1 hour
  static getUserEngagementMetrics = cache(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const metrics = await prisma.$transaction(async (tx) => {
      const totalUsers = await tx.user.count();
      const activeUsers = await tx.userEngagement.count({
        where: {
          lastActive: {
            gte: thirtyDaysAgo,
          },
        },
      });

      const messageStats = await tx.message.groupBy({
        by: ['senderId'],
        _count: {
          _all: true,
        },
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      return {
        totalUsers,
        activeUsers,
        engagementRate: (activeUsers / totalUsers) * 100,
        averageMessagesPerUser: messageStats.length > 0
          ? messageStats.reduce((acc, stat) => acc + stat._count._all, 0) / messageStats.length
          : 0,
      };
    });

    return metrics;
  });

  // Cache order analytics for 30 minutes
  static getOrderAnalytics = cache(async (period: 'day' | 'week' | 'month' = 'month') => {
    const periodStart = new Date();
    switch (period) {
      case 'day':
        periodStart.setDate(periodStart.getDate() - 1);
        break;
      case 'week':
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
    }

    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: {
          gte: periodStart,
        },
      },
    });

    const statusCounts = orderStats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: orderStats.reduce((acc, stat) => acc + stat._count, 0),
      ...statusCounts,
      period,
    };
  });

  // Cache service booking analytics for 1 hour
  static getServiceAnalytics = cache(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookingStats = await prisma.serviceBooking.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return {
      total: bookingStats.reduce((acc, stat) => acc + stat._count, 0),
      byStatus: bookingStats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      period: '30days',
    };
  });
}
