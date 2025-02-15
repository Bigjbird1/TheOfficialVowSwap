'use client';

import { useEffect, useState } from 'react';
import { SellerDashboardData, OrderUpdateData } from '@/app/types/seller';

type FilterOptions = {
  status: string;
  dateRange: string;
};

export default function RecentOrders() {
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<{
    message: string;
    code?: number;
    details?: string;
    retryCount?: number;
  } | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'ALL',
    dateRange: '7D',
  });

  const fetchDashboardData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setRetrying(retryCount > 0);
      setError(null);

      const response = await fetch('/api/seller/dashboard');

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            console.error('Authentication error:', errorData);
            window.location.href = '/auth/signin';
            return;
          case 404:
            console.error('Seller account not found:', errorData);
            window.location.href = '/seller/onboarding';
            return;
          case 503:
            throw new Error('Database connection error. Please try again.');
          default:
            throw new Error(
              errorData?.details ||
              `Server error (${response.status}). Please try again.`
            );
        }
      }

      const data = await response.json();
      setData(data);
      setError(null);
    } catch (error) {
      console.error('Dashboard data fetch error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount,
        timestamp: new Date().toISOString()
      });

      // Set detailed error state
      setError({
        message: 'Failed to load dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        retryCount,
      });

      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        setTimeout(() => {
          fetchDashboardData(retryCount + 1);
        }, backoffDelay);
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  const updateOrderStatus = async (orderId: string, updateData: OrderUpdateData) => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/seller/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const errorData = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Order status update error:', {
          orderId,
          status: response.status,
          error: errorData,
          timestamp: new Date().toISOString()
        });

        // Handle specific error cases
        switch (response.status) {
          case 401:
            window.location.href = '/auth/signin';
            return;
          case 404:
            throw new Error('Order not found');
          case 403:
            throw new Error('Not authorized to update this order');
          default:
            throw new Error(
              errorData?.details || 
              `Failed to update order status (${response.status})`
            );
        }
      }
      
      // Refresh the orders list
      await fetchDashboardData();
    } catch (error) {
      console.error('Order status update error:', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      setError({
        message: 'Failed to update order status',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
      });

      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filterOrders = (orders: SellerDashboardData['recentOrders']) => {
    return orders.filter(order => {
      // Filter by status
      if (filters.status !== 'ALL' && order.status !== filters.status) {
        return false;
      }

      // Filter by date range
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const daysDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

      switch (filters.dateRange) {
        case '24H':
          return daysDiff <= 1;
        case '7D':
          return daysDiff <= 7;
        case '30D':
          return daysDiff <= 30;
        default:
          return true;
      }
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderUpdateData['status']) => {
    await updateOrderStatus(orderId, { status: newStatus });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex gap-4 mb-4">
          <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50">
          <div className="bg-gray-50 px-6 py-3">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-gray-50 p-6 text-center shadow-lg shadow-gray-200/50 border border-gray-100">
        <div className="space-y-3">
          <p className="text-gray-800 font-medium">
            {error?.message || 'Failed to load orders'}
          </p>
          {error?.details && (
            <p className="text-gray-500 text-sm">
              {error.details}
            </p>
          )}
          {error && (
            <div className="space-y-2">
              <button 
                onClick={() => fetchDashboardData(0)}
                disabled={retrying}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {retrying ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Retrying...
                  </span>
                ) : (
                  'Try Again'
                )}
              </button>
              {error.retryCount && error.retryCount > 0 && (
                <p className="text-gray-500 text-xs">
                  Retry attempt {error.retryCount} of 3
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredOrders = filterOrders(data.recentOrders);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <select
          className="rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 bg-white"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          className="rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 bg-white"
          value={filters.dateRange}
          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
        >
          <option value="24H">Last 24 Hours</option>
          <option value="7D">Last 7 Days</option>
          <option value="30D">Last 30 Days</option>
          <option value="ALL">All Time</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt.toString())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.items.length} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {updating === order.id ? (
                    <span className="text-sm text-gray-500">Updating...</span>
                  ) : (
                    <select
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)} border-0 focus:ring-2 focus:ring-offset-2 focus:ring-primary/50`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderUpdateData['status'])}
                    >
                      <option value="PENDING" className="bg-white text-gray-900">Pending</option>
                      <option value="PROCESSING" className="bg-white text-gray-900">Processing</option>
                      <option value="SHIPPED" className="bg-white text-gray-900">Shipped</option>
                      <option value="DELIVERED" className="bg-white text-gray-900">Delivered</option>
                      <option value="CANCELLED" className="bg-white text-gray-900">Cancelled</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
