import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { AnalyticsService } from '@/app/services/AnalyticsService';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const metrics = await AnalyticsService.getUserEngagementMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
