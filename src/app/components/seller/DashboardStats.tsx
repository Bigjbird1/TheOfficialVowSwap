'use client';

'use client';

import { useEffect, useState } from 'react';
import { SellerDashboardData, SellerStats } from '@/app/types/seller';
import { AreaChart, BarChart, PieChart } from '@/app/components/charts';

// Development-only dummy data
const getDummyData = (): SellerDashboardData => ({
  seller: {
    id: 'dummy-seller-id',
    userId: 'dummy-user-id',
    storeName: 'My Store',
    contactEmail: 'store@example.com',
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: '',
    phoneNumber: '',
    address: '',
    bannerImage: '',
    logoImage: '',
    themeColor: '',
    accentColor: '',
    fontFamily: '',
    layout: {
      sections: [
        {
          id: 'products',
          type: 'products',
          title: 'Featured Products',
          order: 1,
          isVisible: true,
        },
      ],
    },
    socialLinks: {},
    businessHours: {},
    policies: {},
    rating: 0,
    totalSales: 0,
  },
  stats: {
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: {
      total: 0,
      monthly: 0,
      weekly: 0,
      daily: 0,
      byCategory: {},
    },
    topProducts: [],
  },
  recentOrders: [],
});

export default function DashboardStats() {
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/seller/dashboard');

        if (!response.ok) {
          throw new Error(
            `Failed to fetch dashboard data: ${response.status} ${response.statusText}`
          );
        }

        const dashboardData = await response.json();

        if (!dashboardData || !dashboardData.stats) {
          console.log('Empty dashboard data received, using dummy data');
          setData(getDummyData());
        } else {
          setData(dashboardData);
        }
      } catch (error: any) {
        console.error('Dashboard Error:', error);
        setError(error.message || 'Failed to fetch dashboard data');
        setData(getDummyData()); // Use dummy data on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className={`p-6 ${
          error ? 'bg-red-50' : 'bg-gray-50'
        } rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {error ? (
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3
              className={`text-sm font-medium ${
                error ? 'text-red-800' : 'text-gray-800'
              }`}
            >
              {error ? 'Dashboard Error' : 'No Dashboard Data'}
            </h3>
            <div
              className={`mt-2 text-sm ${
                error ? 'text-red-700' : 'text-gray-600'
              }`}
            >
              <p>
                {error ||
                  'No dashboard data available yet. Start selling to see your statistics here!'}
              </p>
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

        const statusCounts = data.recentOrders.reduce(
            (acc: { [key: string]: number }, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            },
            {}
        );

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
      sales: product.popularity,
      revenue: product.price * product.popularity,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100"
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
        <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
          <AreaChart
            title="Revenue Overview"
            data={[
              {
                date: new Date().toISOString().split('T')[0],
                value: stats.revenue.daily,
                label: 'Today',
              },
              {
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0],
                value: stats.revenue.weekly,
                label: 'Last 7 Days',
              },
              {
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0],
                value: stats.revenue.monthly,
                label: 'Last 30 Days',
              },
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
        </div>
        <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
          <PieChart
            title="Order Status Distribution"
            data={getOrderStatusData()}
            height={300}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
        <BarChart
          title="Top Products Performance"
          data={getTopProductsData().map((item) => ({
            ...item,
            revenue: Number(item.revenue.toFixed(2)),
            name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
          }))}
          bars={[
            { key: 'sales', name: 'Units Sold', color: '#3b82f6' },
            { key: 'revenue', name: 'Revenue ($)', color: '#10b981' },
          ]}
          xAxisKey="name"
        />
      </div>
        {/* New section for revenue by category */}
      <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(stats.revenue.byCategory)
                .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
                .map(([category, revenue]) => (
                  <tr key={category}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${(revenue as number).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
