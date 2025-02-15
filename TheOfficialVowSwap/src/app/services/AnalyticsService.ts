import { startOfDay, subDays, format, parseISO } from 'date-fns';
import prisma from '@/lib/prisma';
import { ProductMetrics, SalesMetrics, UserEngagementMetrics, InventoryMetrics } from '../types/analytics';

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    price: number;
    inventory: number;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: Date;
  status: string;
}

interface ProductView {
  id: string;
  productId: string;
  userId: string | null;
  sessionId: string | null;
  timestamp: Date;
}

interface SaleMetric {
  id: string;
  sellerId: string;
  date: Date;
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
}

interface InventoryLog {
  id: string;
  productId: string;
  quantity: number;
  type: string;
  timestamp: Date;
  note: string | null;
}

export class AnalyticsService {
  static async getProductMetrics(productId: string): Promise<ProductMetrics> {
    const [product, views, orders] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
      }),
      prisma.productView.groupBy({
        by: ['productId'],
        where: { productId },
        _count: {
          id: true,
        },
        _count_distinct: {
          userId: true,
        },
      }),
      prisma.orderItem.findMany({
        where: { productId },
        include: {
          order: true,
        },
      }),
    ]);

    if (!product) throw new Error('Product not found');

    const revenue = orders.reduce((sum: number, item: OrderItem) => sum + item.totalPrice, 0);
    const soldCount = orders.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0);

    return {
      id: product.id,
      name: product.name,
      totalViews: views[0]?._count.id ?? 0,
      uniqueViews: views[0]?._count_distinct.userId ?? 0,
      conversionRate: views[0]?._count.id ? (soldCount / views[0]._count.id) * 100 : 0,
      revenue,
      inventory: product.inventory,
      soldCount,
    };
  }

  static async getSalesMetrics(sellerId: string, days: number = 30): Promise<SalesMetrics> {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const [orders, dailyStats] = await Promise.all([
      prisma.order.findMany({
        where: {
          sellerId,
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.salesMetric.findMany({
        where: {
          sellerId,
          date: { gte: startDate },
        },
        orderBy: {
          date: 'asc',
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;

    // Get top products
    const productSales = new Map<string, { revenue: number; count: number }>();
    orders.forEach((order: Order) => {
      order.items.forEach((item: OrderItem) => {
        const current = productSales.get(item.productId) || { revenue: 0, count: 0 };
        productSales.set(item.productId, {
          revenue: current.revenue + item.totalPrice,
          count: current.count + item.quantity,
        });
      });
    });

    const topProductsPromises = Array.from(productSales.entries())
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([productId]) => this.getProductMetrics(productId));

    const topProducts = await Promise.all(topProductsPromises);

    return {
      totalRevenue,
      orderCount,
      averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
      dailyRevenue: dailyStats.map((stat: SaleMetric) => ({
        date: format(stat.date, 'yyyy-MM-dd'),
        revenue: stat.revenue,
        orderCount: stat.orderCount,
      })),
      topProducts,
    };
  }

  static async getInventoryMetrics(sellerId: string): Promise<InventoryMetrics> {
    const products = await prisma.product.findMany({
      where: { sellerId },
      include: {
        orderItems: true,
        inventoryLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    const lowStockThreshold = 5; // Configure as needed
    const lowStockProducts: ProductMetrics[] = [];
    const outOfStockProducts: ProductMetrics[] = [];
    let totalValue = 0;

    for (const product of products) {
      if (product.inventory <= 0) {
        outOfStockProducts.push(await this.getProductMetrics(product.id));
      } else if (product.inventory <= lowStockThreshold) {
        lowStockProducts.push(await this.getProductMetrics(product.id));
      }
      totalValue += product.price * product.inventory;
    }

    // Calculate inventory turnover
    const totalCost = totalValue;
    const soldItems = await prisma.orderItem.aggregate({
      where: {
        product: { sellerId },
        order: {
          createdAt: { gte: subDays(new Date(), 365) }, // Last year
          status: { not: 'CANCELLED' },
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const inventoryTurnover = totalCost > 0 ? (soldItems._sum.totalPrice || 0) / totalCost : 0;

    return {
      totalProducts: products.length,
      lowStockProducts,
      outOfStockProducts,
      inventoryValue: totalValue,
      inventoryTurnover,
    };
  }

  static async getUserEngagementMetrics(sellerId: string): Promise<UserEngagementMetrics> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const today = startOfDay(new Date());

    const [totalUsersData, activeUsersData, newUsersData] = await Promise.all([
      prisma.user.count(),
      prisma.userEngagement.count({
        where: {
          lastLogin: { gte: thirtyDaysAgo },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Calculate user retention
    const previousMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
          gte: subDays(thirtyDaysAgo, 30),
        },
      },
    });

    const retainedUsers = await prisma.userEngagement.count({
      where: {
        user: {
          createdAt: {
            lt: thirtyDaysAgo,
            gte: subDays(thirtyDaysAgo, 30),
          },
        },
        lastLogin: { gte: thirtyDaysAgo },
      },
    });

    const retentionRate = previousMonthUsers > 0 ? (retainedUsers / previousMonthUsers) * 100 : 0;

    // Get daily active users for the last 30 days
    const dailyActivity = await prisma.userEngagement.groupBy({
      by: ['lastLogin'],
      where: {
        lastLogin: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    const userActivity = dailyActivity.map((day: { lastLogin: Date; _count: number }) => ({
      date: format(day.lastLogin, 'yyyy-MM-dd'),
      activeUsers: day._count,
      newUsers: 0, // We'll update this next
    }));

    // Get new users per day
    const newUsersByDay = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    // Merge new users data into userActivity
    newUsersByDay.forEach((day: { createdAt: Date; _count: number }) => {
      const activityIndex = userActivity.findIndex(
        (a: { date: string }) => a.date === format(day.createdAt, 'yyyy-MM-dd')
      );
      if (activityIndex !== -1) {
        userActivity[activityIndex].newUsers = day._count;
      }
    });

    return {
      totalUsers: totalUsersData,
      activeUsers: activeUsersData,
      newUsers: newUsersData,
      userRetentionRate: retentionRate,
      averageSessionDuration: 0, // This would require additional tracking
      userActivity,
    };
  }
}
