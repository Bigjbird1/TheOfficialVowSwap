export interface BulkPurchaseRequest {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  requirements?: string;
  status: BulkRequestStatus;
  notes?: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
  responses: BulkPurchaseResponse[];
  // Expanded relationships
  buyer: {
    id: string;
    name: string | null;
    email: string;
  };
  seller: {
    id: string;
    storeName: string;
    contactEmail: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export interface BulkPurchaseResponse {
  id: string;
  requestId: string;
  sellerId: string;
  customPrice: number;
  estimatedDelivery: Date;
  notes?: string;
  status: BulkResponseStatus;
  createdAt: Date;
  updatedAt: Date;
  // Expanded relationships
  seller: {
    id: string;
    name: string | null;
    email: string;
  };
}

export enum BulkRequestStatus {
  PENDING = 'PENDING',
  RESPONDED = 'RESPONDED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum BulkResponseStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export interface CreateBulkPurchaseRequestInput {
  productId: string;
  quantity: number;
  requirements?: string;
  notes?: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface CreateBulkPurchaseResponseInput {
  requestId: string;
  customPrice: number;
  estimatedDelivery: Date;
  notes?: string;
}

export interface UpdateBulkRequestStatusInput {
  requestId: string;
  status: BulkRequestStatus;
}

export interface UpdateBulkResponseStatusInput {
  responseId: string;
  status: BulkResponseStatus;
}

// API Response types
export interface BulkPurchaseRequestsResponse {
  requests: BulkPurchaseRequest[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BulkPurchaseResponsesResponse {
  responses: BulkPurchaseResponse[];
  total: number;
  page: number;
  pageSize: number;
}
