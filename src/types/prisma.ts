import { Prisma } from '@prisma/client';

export type OrderWithTotal = Prisma.OrderGetPayload<{
  select: {
    id: true;
    total: true;
    status: true;
    createdAt: true;
    updatedAt: true;
    userId: true;
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export type OrderAnalytics = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  activeUsers: number;
  productViews: number;
  conversionRate: number;
};

export type UserEngagementMetrics = {
  totalUsers: number;
  activeUsers: number;
  engagementRate: number;
  averageMessagesPerUser: number;
};

export type ServiceAnalytics = {
  total: number;
  byStatus: Record<string, number>;
  period: string;
};
