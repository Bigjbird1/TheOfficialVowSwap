"use client";

import { ShippingCarrier, ShippingStatus, TrackingDetails } from "@/app/types/shipping";
import { format } from "date-fns";
import { useShippingTracking } from "@/app/hooks/useShippingTracking";

export default function ShippingTracker({
  orderId,
  trackingNumber,
  carrier,
}: {
  orderId: string;
  trackingNumber: string;
  carrier: ShippingCarrier;
}) {
  const { trackingDetails, isLoading, error, refreshTracking } = useShippingTracking({
    trackingNumber,
    carrier,
    orderId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error.message}</p>
        <button 
          onClick={refreshTracking}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!trackingDetails) {
    return null;
  }

  const getStatusColor = (status: ShippingStatus) => {
    switch (status) {
      case ShippingStatus.DELIVERED:
        return "bg-green-500";
      case ShippingStatus.EXCEPTION:
        return "bg-red-500";
      case ShippingStatus.IN_TRANSIT:
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Shipment Tracking</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Tracking Number</p>
            <p className="font-medium">{trackingDetails.trackingNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Carrier</p>
            <p className="font-medium">{trackingDetails.carrier}</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Current Status</p>
            <p className="font-semibold text-lg">
              {trackingDetails.status.replace(/_/g, " ")}
            </p>
          </div>
          {trackingDetails.estimatedDeliveryDate && (
            <div className="text-right">
              <p className="text-gray-600">Estimated Delivery</p>
              <p className="font-semibold">
                {format(
                  new Date(trackingDetails.estimatedDeliveryDate),
                  "MMM d, yyyy"
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {trackingDetails.events.map((event, index) => (
          <div key={index} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div
                className={`w-4 h-4 rounded-full ${getStatusColor(
                  event.status
                )}`}
              ></div>
              {index < trackingDetails.events.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 my-1"></div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{event.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <p>{event.location}</p>
                <p>
                  {format(new Date(event.timestamp), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Last Updated */}
      <div className="mt-6 text-sm text-gray-500 text-right">
        Last updated:{" "}
        {format(new Date(trackingDetails.lastUpdated), "MMM d, yyyy h:mm a")}
      </div>
    </div>
  );
}
