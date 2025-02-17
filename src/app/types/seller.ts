interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  quantity: number;
  isActive: boolean;
  rating: number;
  totalSales: number;
  tags: string[];
  theme?: string;
  popularity: number;
  isNewArrival: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: string;
  userId: string;
  sellerId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  shippingAddress: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Seller {
  id: string;
  userId: string;
  storeName: string;
  description?: string;
  contactEmail: string;
  phoneNumber?: string;
  address?: string;
  bannerImage?: string;
  logoImage?: string;
  themeColor?: string;
  accentColor?: string;
  fontFamily?: string;
  layout: StorefrontLayout;
  socialLinks: StorefrontSocialLinks;
  businessHours: StorefrontBusinessHours;
  policies: StorefrontPolicies;
  rating: number;
  totalSales: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type StorefrontLayout = {
  sections: Array<{
    id: string;
    type: 'products' | 'about' | 'contact' | 'custom';
    title: string;
    order: number;
    isVisible: boolean;
    content?: string;
  }>;
};

export type StorefrontSocialLinks = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  pinterest?: string;
  website?: string;
  [key: string]: string | undefined;
};

export type StorefrontBusinessHours = {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
  [key: string]: { open: string; close: string } | undefined;
};

export type StorefrontPolicies = {
  shipping?: string;
  returns?: string;
  customization?: string;
  terms?: string;
  [key: string]: string | undefined;
};

export type StorefrontCustomization = {
  bannerImage?: string;
  logoImage?: string;
  themeColor?: string;
  accentColor?: string;
  fontFamily?: string;
  layout: StorefrontLayout;
  socialLinks?: StorefrontSocialLinks;
  businessHours?: StorefrontBusinessHours;
  policies?: StorefrontPolicies;
};

export type StorefrontUpdateData = Partial<StorefrontCustomization>;

export type SalesMetrics = {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
  byCategory: { [key: string]: number };
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
