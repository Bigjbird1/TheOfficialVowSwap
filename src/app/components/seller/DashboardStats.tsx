'use client';

import { useEffect, useState } from 'react';
import { SellerDashboardData } from '@/app/types/seller';
import { AreaChart, BarChart, PieChart } from '@/app/components/charts';

// Development-only dummy data
const getDummyData = () => ({
  revenue: {
    total: 0,
    monthly: 0,
    weekly: 0,
    daily: 0
  },
  activeProducts: 0,
  totalProducts: 0,
  pendingOrders: 0,
  totalOrders: 0,
  topProducts: []
});

export default function DashboardStats() {
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async (retryCount = 0) => {
      try {
        setLoading(true);
        const response = await fetch('/api/seller/dashboard');
        
        if (!response.ok) {
          const errorText = await response.text();
          const statusCode = response.status;
          
          // Log detailed error information
          console.error('Dashboard API Error:', {
            status: statusCode,
            statusText: response.statusText,
            error: errorText,
            timestamp: new Date().toISOString()
          });

          // Handle specific error cases
          if (statusCode === 401) {
            throw new Error('Please sign in to access the dashboard');
          } else if (statusCode === 403) {
            throw new Error('You do not have permission to access the dashboard');
          } else if (statusCode === 404) {
            // Return empty state data instead of throwing error
            return { stats: getDummyData(), recentOrders: [] };
          }

          // For 5xx errors, attempt retry
          if (statusCode >= 500 && retryCount < 3) {
            throw new Error('RETRY');
          }

          throw new Error(errorText || `Failed to fetch dashboard data (${statusCode})`);
        }

        const dashboardData = await response.json();
        
        // Check if the response is empty or missing required data
        if (!dashboardData || !dashboardData.stats) {
          console.log('Empty dashboard data received:', dashboardData);
          return { stats: getDummyData(), recentOrders: [] };
        }

        return dashboardData;
      } catch (error) {
        if (error instanceof Error && error.message === 'RETRY' && retryCount < 3) {
          console.log(`Retrying dashboard fetch (attempt ${retryCount + 1}/3)...`);
          setTimeout(() => fetchDashboardData(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
        console.error('Dashboard Error:', {
          error: errorMessage,
          retryCount,
          timestamp: new Date().toISOString()
        });
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData().then(result => {
      if (result) {
        setData(result);
        setError(null);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data || error) {
    const isEmptyData = !error && (!data?.stats || Object.keys(data?.stats || {}).length === 0);
    
    return (
      <div className={`p-6 ${error ? 'bg-red-50' : 'bg-gray-50'} rounded-lg`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {error ? (
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${error ? 'text-red-800' : 'text-gray-800'}`}>
              {error ? 'Dashboard Error' : 'No Dashboard Data'}
            </h3>
            <div className={`mt-2 text-sm ${error ? 'text-red-700' : 'text-gray-600'}`}>
              <p>{error || (isEmptyData ? 'No dashboard data available yet. Start selling to see your statistics here!' : 'Failed to load dashboard data')}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                  error 
                    ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { stats } = data;

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.revenue.total.toFixed(2)}`,
      subtitle: 'All time sales',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.revenue.monthly.toFixed(2)}`,
      subtitle: 'Last 30 days',
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      subtitle: `of ${stats.totalProducts} total`,
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      subtitle: `of ${stats.totalOrders} total`,
    },
  ];

  const getOrderStatusData = () => {
    if (!data) return [];
    
    const statusCounts = data.recentOrders.reduce((acc: { [key: string]: number }, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      PENDING: '#fbbf24',
      PROCESSING: '#60a5fa',
      SHIPPED: '#34d399',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: count,
      color: colors[status as keyof typeof colors],
    }));
  };

  const getTopProductsData = () => {
    if (!data) return [];
    return data.stats.topProducts.map((product) => ({
      name: product.name,
      sales: product.totalSales,
      revenue: product.totalSales * product.price,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-gray-500">{card.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChart
          title="Revenue Overview"
          data={[
            { date: new Date().toISOString().split('T')[0], value: stats.revenue.daily, label: 'Today' },
            { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], value: stats.revenue.weekly, label: 'Last 7 Days' },
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], value: stats.revenue.monthly, label: 'Last 30 Days' },
          ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
          areas={[
            {
              key: 'value',
              name: 'Revenue ($)',
              color: '#3b82f6',
            },
          ]}
          xAxisKey="date"
        />

        <PieChart
          title="Order Status Distribution"
          data={getOrderStatusData()}
          height={300}
        />
      </div>

      <div className="mt-6">
        <BarChart
          title="Top Products Performance"
          data={getTopProductsData().map(item => ({
            ...item,
            revenue: Number(item.revenue.toFixed(2)),
            name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name
          }))}
          bars={[
            {
              key: 'sales',
              name: 'Units Sold',
              color: '#3b82f6',
            },
            {
              key: 'revenue',
              name: 'Revenue ($)',
              color: '#10b981',
            },
          ]}
          xAxisKey="name"
        />
      </div>
    </div>
  );
}
