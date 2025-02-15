"use client";

import { useState, useEffect } from "react";
import { OrderHistoryProps } from "@/app/types/dashboard";
import { formatDistance } from "date-fns";

export default function OrderHistory({ orders, isLoading }: OrderHistoryProps) {

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          When you make a purchase, your orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Order History</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">
                    Order #{order.id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDistance(new Date(order.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-800"
                      : order.status === "PROCESSING"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "SHIPPED"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">Shipping Address</p>
                    <p className="text-gray-500">{order.shippingAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Total Amount</p>
                    <p className="text-gray-500">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm">
                    <span className="font-medium">Tracking Number: </span>
                    {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
