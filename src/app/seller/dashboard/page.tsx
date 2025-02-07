import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardStats from '@/app/components/seller/DashboardStats';
import RecentOrders from '@/app/components/seller/RecentOrders';
import ProductManagement from '@/app/components/seller/ProductManagement';
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
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
      
      <div className="grid gap-6">
        <Suspense fallback={<div>Loading stats...</div>}>
          <DashboardStats />
        </Suspense>

        <div className="grid md:grid-cols-2 gap-6">
          <Suspense fallback={<div>Loading orders...</div>}>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
              <RecentOrders />
            </div>
          </Suspense>

          <Suspense fallback={<div>Loading products...</div>}>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Product Management</h2>
              <ProductManagement />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
