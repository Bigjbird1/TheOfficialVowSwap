import { ShippingCarrier, ShippingEvent, ShippingStatus, TrackingDetails } from '../types/shipping';

class ShippingService {
  private readonly apiKeys: Record<ShippingCarrier, string>;

  constructor() {
    this.apiKeys = {
      [ShippingCarrier.USPS]: process.env.USPS_API_KEY || '',
      [ShippingCarrier.UPS]: process.env.UPS_API_KEY || '',
      [ShippingCarrier.FEDEX]: process.env.FEDEX_API_KEY || '',
      [ShippingCarrier.DHL]: process.env.DHL_API_KEY || '',
    };
  }

  private validateApiKey(carrier: ShippingCarrier): void {
    if (!this.apiKeys[carrier]) {
      throw new Error(`API key not configured for carrier: ${carrier}`);
    }
  }

  async getTrackingDetails(
    trackingNumber: string,
    carrier: ShippingCarrier
  ): Promise<TrackingDetails> {
    this.validateApiKey(carrier);

    try {
      // In a real implementation, this would make API calls to the respective carriers
      // For demonstration, we'll return mock data
      const mockEvents: ShippingEvent[] = [
        {
          timestamp: new Date(),
          status: ShippingStatus.PICKED_UP,
          location: 'Origin Facility',
          description: 'Package picked up by carrier',
        },
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: ShippingStatus.IN_TRANSIT,
          location: 'Transit Hub',
          description: 'Package in transit to destination',
        },
      ];

      return {
        trackingNumber,
        carrier,
        status: ShippingStatus.IN_TRANSIT,
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        events: mockEvents,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error fetching tracking details:', error);
      throw new Error('Failed to fetch tracking details');
    }
  }

  // Method to update tracking information in the database
  async updateTrackingInfo(orderId: string, trackingDetails: TrackingDetails): Promise<void> {
    try {
      // In a real implementation, this would update the database
      // For now, we'll just log the update
      console.log(`Updating tracking info for order ${orderId}:`, trackingDetails);
    } catch (error) {
      console.error('Error updating tracking info:', error);
      throw new Error('Failed to update tracking information');
    }
  }

  // Method to poll for tracking updates
  async pollTrackingUpdates(
    trackingNumber: string,
    carrier: ShippingCarrier,
    orderId: string
  ): Promise<void> {
    try {
      const trackingDetails = await this.getTrackingDetails(trackingNumber, carrier);
      await this.updateTrackingInfo(orderId, trackingDetails);
    } catch (error) {
      console.error('Error polling tracking updates:', error);
      throw new Error('Failed to poll tracking updates');
    }
  }
}

// Export as singleton
export const shippingService = new ShippingService();
