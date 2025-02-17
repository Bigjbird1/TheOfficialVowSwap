import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/auth.config';
import DashboardStats from '@/app/components/seller/DashboardStats';
import RecentOrders from '@/app/components/seller/RecentOrders';
import ProductManagement from '@/app/components/seller/ProductManagement';
import ListItemButton from '@/app/components/seller/ListItemButton';
import prisma from '@/lib/prisma';

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { seller: true },
  });

  if (!user?.seller) {
    redirect('/seller/onboarding');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
          Seller Dashboard
        </h1>
        <ListItemButton />
      </div>
      
      <div className="space-y-6">
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
      </div>
    </div>
  );
}
