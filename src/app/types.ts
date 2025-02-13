export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Review {
  id: string
  userId: string
  user: {
    id: string
    name: string
    image?: string
  }
  productId: string
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
  status: ReviewStatus
  moderatedBy?: string
  moderatedAt?: string
  helpfulCount: number
  reportCount: number
  replies: ReviewReply[]
}

export interface ReviewReply {
  id: string
  reviewId: string
  userId: string
  user: {
    id: string
    name: string
    image?: string
  }
  comment: string
  createdAt: string
  updatedAt: string
}

export interface ReviewReport {
  id: string
  reviewId: string
  userId: string
  reason: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  size?: string
  color?: string
  condition?: string
  rating: number
  reviewCount: number
  stockStatus: string
  images: {
    id: string
    url: string
    alt: string
  }[]
  specifications: {
    [key: string]: string | undefined
  }
  shippingInfo: string
  sellerName: string
  sellerRating: number
}
