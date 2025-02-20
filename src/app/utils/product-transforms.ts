import type { Product as PrismaProduct, Seller } from '@prisma/client';
import type { Product as AppProduct } from '../types';

export function transformPrismaProduct(
  prismaProduct: PrismaProduct & { seller: Seller }
): AppProduct {
  return {
    id: prismaProduct.id,
    name: prismaProduct.name,
    price: prismaProduct.price,
    description: prismaProduct.description,
    category: prismaProduct.category,
    size: prismaProduct.size || undefined,
    color: prismaProduct.color || undefined,
    condition: prismaProduct.condition || undefined,
    rating: prismaProduct.rating,
    reviewCount: prismaProduct.reviewCount,
    stockStatus: prismaProduct.stockStatus,
    images: prismaProduct.images as AppProduct['images'],
    specifications: prismaProduct.specifications as AppProduct['specifications'],
    shippingInfo: prismaProduct.shippingInfo,
    sellerName: prismaProduct.seller.storeName,
    sellerRating: 0, // This should come from seller's average rating calculation
  };
}
