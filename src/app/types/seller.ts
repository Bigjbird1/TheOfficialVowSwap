import { Product, Order, Seller } from '@prisma/client';

export type SalesMetrics = {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
};

export type SellerStats = {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: SalesMetrics;
  topProducts: Array<Product & { totalSales: number }>;
};

export type SellerDashboardData = {
  seller: Seller;
  stats: SellerStats;
  recentOrders: Array<Order & {
    items: Array<{
      product: Product;
      quantity: number;
      totalPrice: number;
    }>;
  }>;
};

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  quantity: number;
  tags: string[];
  bulkDiscounts: Array<{
    minQuantity: number;
    discount: number;
  }>;
};

export type OrderUpdateData = {
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
};
