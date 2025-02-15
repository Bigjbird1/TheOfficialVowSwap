export type PromotionType = 'COUPON' | 'FLASH_SALE' | 'BULK_DISCOUNT';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Promotion {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  type: PromotionType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  couponCode?: CouponCode;
  flashSale?: FlashSale;
  bulkDiscount?: BulkDiscount;
}

export interface CouponCode {
  id: string;
  promotionId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumPurchase?: number;
  maxUses?: number;
  usedCount: number;
  perUserLimit?: number;
}

export interface UsedCoupon {
  id: string;
  couponId: string;
  userId: string;
  usedAt: Date;
  orderId?: string;
}

export interface FlashSale {
  id: string;
  promotionId: string;
  discountType: DiscountType;
  discountValue: number;
  categoryId?: string;
  productIds: string[];
}

export interface BulkDiscount {
  id: string;
  promotionId: string;
  productId: string;
  minQuantity: number;
  discount: number;
  isActive: boolean;
}

// Request/Response types for API endpoints
export interface CreatePromotionRequest {
  name: string;
  description?: string;
  type: PromotionType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  couponCode?: Omit<CouponCode, 'id' | 'promotionId' | 'usedCount'>;
  flashSale?: Omit<FlashSale, 'id' | 'promotionId'>;
  bulkDiscount?: Omit<BulkDiscount, 'id' | 'promotionId'>;
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {
  isActive?: boolean;
}

export interface PromotionResponse {
  success: boolean;
  data?: Promotion;
  error?: string;
}

export interface PromotionsListResponse {
  success: boolean;
  data?: {
    promotions: Promotion[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface ValidateCouponRequest {
  code: string;
  userId: string;
  orderId?: string;
  totalAmount: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  data?: {
    valid: boolean;
    discount?: number;
    discountType?: DiscountType;
    message?: string;
  };
  error?: string;
}
