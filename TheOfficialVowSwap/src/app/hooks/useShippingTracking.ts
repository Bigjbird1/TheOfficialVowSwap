import { useState, useEffect, useCallback } from 'react';
import { ShippingCarrier, TrackingDetails } from '../types/shipping';
import { shippingService } from '../services/ShippingService';

interface UseShippingTrackingProps {
  trackingNumber: string;
  carrier: ShippingCarrier;
  orderId: string;
  pollingInterval?: number;
}

interface UseShippingTrackingResult {
  trackingDetails: TrackingDetails | null;
  isLoading: boolean;
  error: Error | null;
  refreshTracking: () => Promise<void>;
}

export function useShippingTracking({
  trackingNumber,
  carrier,
  orderId,
  pollingInterval = 300000, // 5 minutes default polling interval
}: UseShippingTrackingProps): UseShippingTrackingResult {
  const [trackingDetails, setTrackingDetails] = useState<TrackingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrackingDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const details = await shippingService.getTrackingDetails(trackingNumber, carrier);
      setTrackingDetails(details);
      
      // Update tracking info in the database
      await shippingService.updateTrackingInfo(orderId, details);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tracking details'));
    } finally {
      setIsLoading(false);
    }
  }, [trackingNumber, carrier, orderId]);

  // Initial fetch and polling setup
  useEffect(() => {
    // Initial fetch
    fetchTrackingDetails();

    // Set up polling
    const pollInterval = setInterval(fetchTrackingDetails, pollingInterval);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchTrackingDetails, pollingInterval]);

  // Manual refresh function
  const refreshTracking = useCallback(async () => {
    await fetchTrackingDetails();
  }, [fetchTrackingDetails]);

  return {
    trackingDetails,
    isLoading,
    error,
    refreshTracking,
  };
}
