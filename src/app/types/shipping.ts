import { z } from 'zod';

export enum ShippingStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION'
}

export enum ShippingCarrier {
  USPS = 'USPS',
  UPS = 'UPS',
  FEDEX = 'FEDEX',
  DHL = 'DHL'
}

export interface ShippingEvent {
  timestamp: Date;
  status: ShippingStatus;
  location: string;
  description: string;
}

export interface TrackingDetails {
  trackingNumber: string;
  carrier: ShippingCarrier;
  status: ShippingStatus;
  estimatedDeliveryDate: Date | null;
  events: ShippingEvent[];
  lastUpdated: Date;
}

// Zod schema for validation
export const trackingNumberSchema = z.object({
  trackingNumber: z.string().min(1),
  carrier: z.nativeEnum(ShippingCarrier)
});

export type TrackingNumberInput = z.infer<typeof trackingNumberSchema>;

export interface ShippingTrackerProps {
  orderId: string;
  trackingNumber: string;
  carrier: ShippingCarrier;
}
