import { useEffect, useState } from "react";
import { DashboardOverview as DashboardOverviewType } from "@/app/types/dashboard";
import Link from "next/link";
import { formatDistance } from "date-fns";

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardOverviewType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch("/api/dashboard/overview");
        const overview = await response.json();
        setData(overview);
      } catch (error) {
        console.error("Failed to fetch dashboard overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        Unable to load dashboard overview
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Recent Orders</h3>
          <p className="mt-2 text-3xl font-semibold">{data.recentOrders.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Saved Addresses</h3>
          <p className="mt-2 text-3xl font-semibold">{data.savedAddresses}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Payment Methods</h3>
          <p className="mt-2 text-3xl font-semibold">{data.paymentMethods}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Wishlist Items</h3>
          <p className="mt-2 text-3xl font-semibold">{data.wishlistCount}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {data.recentOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">Order #{order.id.slice(-6)}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-800"
                      : order.status === "PROCESSING"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "SHIPPED"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="#" 
            onClick={() => document.querySelector('[data-tab="orders"]')?.click()}
            className="mt-4 inline-block text-primary hover:text-primary-dark"
          >
            View all orders →
          </Link>
        </div>
      </div>

      {/* Registry Progress */}
      {data.registryProgress && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Registry Progress</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-primary">
                  {Math.round((data.registryProgress.purchasedItems / data.registryProgress.totalItems) * 100)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block">
                  {data.registryProgress.purchasedItems} of {data.registryProgress.totalItems} items purchased
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-100">
              <div
                style={{ width: `${(data.registryProgress.purchasedItems / data.registryProgress.totalItems) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
              ></div>
            </div>
            <Link 
              href="#" 
              onClick={() => document.querySelector('[data-tab="registry"]')?.click()}
              className="text-primary hover:text-primary-dark"
            >
              Manage registry →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
