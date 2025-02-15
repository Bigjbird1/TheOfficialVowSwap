export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  userId: string;
  sellerId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  lastFour?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
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

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  addedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkDiscount {
  id: string;
  productId: string;
  minQuantity: number;
  discount: number; // Percentage discount
  isActive: boolean;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Registry {
  id: string;
  userId: string;
  title: string;
  eventDate: Date;
  description?: string;
  isPublic: boolean;
  shareableLink: string;
  items: RegistryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistryItem {
  id: string;
  registryId: string;
  productId: string;
  quantity: number;
  purchased: number;
  addedAt: Date;
  updatedAt: Date;
  priority: number;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardOverview {
  recentOrders: Order[];
  savedAddresses: number;
  paymentMethods: number;
  wishlistCount: number;
  registryProgress?: {
    totalItems: number;
    purchasedItems: number;
  };
}

export interface OrderHistoryProps {
  orders: Order[];
  isLoading?: boolean;
}

export interface AddressManagerProps {
  addresses: Address[];
  onAddAddress: (address: Omit<Address, "id" | "userId">) => Promise<void>;
  onUpdateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  onDeleteAddress: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: (method: Omit<PaymentMethod, "id" | "userId">) => Promise<void>;
  onDeletePaymentMethod: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export interface WishlistManagerProps {
  items: (Product & { addedAt: Date })[];
  onRemoveFromWishlist: (productId: string) => Promise<void>;
  onMoveToCart: (productId: string) => Promise<void>;
  isLoading?: boolean;
}

export interface RegistryManagerProps {
  items: (Product & {
    quantity: number;
    purchased: number;
    addedAt: Date;
  })[];
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemoveItem: (productId: string) => Promise<void>;
  isLoading?: boolean;
}

export type DashboardTab = "overview" | "orders" | "addresses" | "payments" | "wishlist" | "registry";

export interface TabConfig {
  id: DashboardTab;
  label: string;
  icon?: string;
}
