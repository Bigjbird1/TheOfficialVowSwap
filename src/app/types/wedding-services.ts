import { PriceType, BookingStatus, User, Seller } from "@prisma/client";

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

// Filter Types
export interface ServiceFilters {
  categories: string[];
  minRating: number | null;
  location: string | null;
  priceRange: PriceRange | null;
  dateRange: DateRange | null;
}

export type PriceRange = {
  min: number | null;
  max: number | null;
  label: string;
};

export const PRICE_RANGES = [
  { label: 'Any Price', min: null, max: null },
  { label: 'Under $1,000', min: 0, max: 1000 },
  { label: '$1,000 - $2,500', min: 1000, max: 2500 },
  { label: '$2,500 - $5,000', min: 2500, max: 5000 },
  { label: 'Above $5,000', min: 5000, max: null },
] as const;

export type DateRange = {
  start: Date | null;
  end: Date | null;
  label: string;
};

export const DATE_RANGES = [
  { label: 'Any Date', start: null, end: null },
  { 
    label: 'Spring Weddings (March - May)', 
    start: new Date(new Date().getFullYear(), 2, 1), // March 1st
    end: new Date(new Date().getFullYear(), 4, 31) // May 31st
  },
  {
    label: 'Summer Weddings (June - August)',
    start: new Date(new Date().getFullYear(), 5, 1), // June 1st
    end: new Date(new Date().getFullYear(), 7, 31) // August 31st
  },
  {
    label: 'Fall Weddings (September - November)',
    start: new Date(new Date().getFullYear(), 8, 1), // September 1st
    end: new Date(new Date().getFullYear(), 10, 30) // November 30th
  },
  {
    label: 'Winter Weddings (December - February)',
    start: new Date(new Date().getFullYear(), 11, 1), // December 1st
    end: new Date(new Date().getFullYear() + 1, 1, 28) // February 28th/29th
  },
] as const;

export const VENDOR_CATEGORIES = [
  'Photographers',
  'Venues',
  'Catering',
  'Florists',
  'Musicians & DJs',
  'Wedding Planners',
] as const;

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
