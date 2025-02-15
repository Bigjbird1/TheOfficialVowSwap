import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardClientLayout from './client-layout';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'CUSTOMER') {
    redirect('/seller/dashboard');
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
