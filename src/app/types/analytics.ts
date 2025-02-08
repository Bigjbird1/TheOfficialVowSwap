export interface ProductMetrics {
  id: string;
  name: string;
  totalViews: number;
  uniqueViews: number;
  conversionRate: number;
  revenue: number;
  inventory: number;
  soldCount: number;
}

export interface SalesMetrics {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
  topProducts: ProductMetrics[];
}

export interface UserEngagementMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userRetentionRate: number;
  averageSessionDuration: number;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
  }>;
}

export interface InventoryMetrics {
  totalProducts: number;
  lowStockProducts: ProductMetrics[];
  outOfStockProducts: ProductMetrics[];
  inventoryValue: number;
  inventoryTurnover: number;
}

export interface DashboardMetrics {
  sales: SalesMetrics;
  userEngagement: UserEngagementMetrics;
  inventory: InventoryMetrics;
  timeRange: string;
}

export interface SellerDashboardMetrics extends DashboardMetrics {
  storeName: string;
  storeId: string;
}

export interface AdminDashboardMetrics extends DashboardMetrics {
  totalSellers: number;
  topSellers: Array<{
    id: string;
    name: string;
    revenue: number;
    orderCount: number;
  }>;
  platformMetrics: {
    totalGMV: number;
    platformFees: number;
    activeListings: number;
  };
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface MetricsFilter extends DateRangeFilter {
  category?: string;
  productId?: string;
  sellerId?: string;
}
