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
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'ALL',
    dateRange: '7D',
  });

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/seller/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

      if (!response.ok) throw new Error('Failed to update order status');
      
      // Refresh the orders list
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
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
        <p className="text-gray-500">Failed to load orders</p>
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
