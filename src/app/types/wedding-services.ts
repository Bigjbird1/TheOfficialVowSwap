import { PriceType, BookingStatus } from "@prisma/client";

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeddingService {
  id: string;
  name: string;
  description: string;
  price: number | null;
  priceType: PriceType;
  categoryId: string;
  category?: ServiceCategory;
  sellerId: string;
  seller?: Seller;
  images: string[];
  features: string[];
  availability: {
    [key: string]: {
      start: string;
      end: string;
      isAvailable: boolean;
    }[];
  } | null;
  bookings?: ServiceBooking[];
  reviews?: ServiceReview[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  listingFee?: number | null;
  commission?: number | null;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  service?: WeddingService;
  sellerId: string;
  seller?: Seller;
  userId: string;
  user?: User;
  status: BookingStatus;
  date: Date;
  startTime?: Date | null;
  endTime?: Date | null;
  notes?: string | null;
  totalAmount: number;
  deposit?: number | null;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioItem {
  id: string;
  sellerId: string;
  seller?: Seller;
  title: string;
  description?: string | null;
  imageUrl: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  service?: WeddingService;
  sellerId: string;
  seller?: Seller;
  rating: number;
  comment?: string | null;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types for API endpoints
export interface CreateServiceRequest {
  name: string;
  description: string;
  price?: number;
  priceType: PriceType;
  categoryId: string;
  images: string[];
  features: string[];
  availability?: {
    [key: string]: {
      start: string;
      end: string;
      isAvailable: boolean;
    }[];
  };
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  isActive?: boolean;
}

export interface CreateBookingRequest {
  serviceId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  deposit?: number;
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  date?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  isPaid?: boolean;
}

export interface CreatePortfolioItemRequest {
  title: string;
  description?: string;
  imageUrl: string;
  date: string;
}

export interface CreateServiceReviewRequest {
  serviceId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

// Response types
export interface ServiceResponse {
  service: WeddingService;
  category: ServiceCategory;
  seller: {
    id: string;
    storeName: string;
    description?: string;
    location?: string;
    rating?: number;
  };
}

export interface BookingResponse {
  booking: ServiceBooking;
  service: WeddingService;
  seller: {
    id: string;
    storeName: string;
    contactEmail: string;
  };
}

export interface ServiceListResponse {
  services: ServiceResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BookingListResponse {
  bookings: BookingResponse[];
  total: number;
  page: number;
  totalPages: number;
}
