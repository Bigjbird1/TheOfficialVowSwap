'use client';

import { Suspense, useState } from 'react';
import DashboardStats from '@/app/components/seller/DashboardStats';
import RecentOrders from '@/app/components/seller/RecentOrders';
import ProductManagement from '@/app/components/seller/ProductManagement';
import ListItemButton from '@/app/components/seller/ListItemButton';
import MessagingSystem from '@/app/components/seller/MessagingSystem';

type TabType = 'overview' | 'products' | 'messages';

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
          Seller Dashboard
        </h1>
        <ListItemButton />
      </div>
      
      <div className="space-y-6">
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'messages'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Messages
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            }>
              <DashboardStats />
            </Suspense>

            <div className="grid md:grid-cols-2 gap-6">
              <Suspense fallback={
                <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
              }>
                <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                  <RecentOrders />
                </div>
              </Suspense>

              <Suspense fallback={
                <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
              }>
                <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100" data-testid="product-management">
                  <h2 className="text-lg font-semibold mb-4">Product Management</h2>
                  <ProductManagement />
                </div>
              </Suspense>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <Suspense fallback={
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          }>
            <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
              <ProductManagement />
            </div>
          </Suspense>
        )}

        {activeTab === 'messages' && (
          <Suspense fallback={
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          }>
            <MessagingSystem />
          </Suspense>
        )}
      </div>
    </div>
  );
}
