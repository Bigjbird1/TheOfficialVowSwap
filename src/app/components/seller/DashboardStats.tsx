'use client';

import { useEffect, useState } from 'react';
import { SellerDashboardData } from '@/app/types/seller';

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

  return (
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
  );
}
