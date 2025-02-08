'use client';

import { useEffect, useState } from 'react';
import { SellerDashboardData } from '@/app/types/seller';
import { AreaChart, BarChart, PieChart } from '@/app/components/charts';

export default function DashboardStats() {
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Failed to load dashboard data</div>;

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
