import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { AnalyticsService } from '@/app/services/AnalyticsService';
import { z } from 'zod';

const periodSchema = z.enum(['day', 'week', 'month']).optional();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = periodSchema.parse(searchParams.get('period') || 'week');
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return new NextResponse('Missing sellerId parameter', { status: 400 });
    }

    const analytics = await AnalyticsService.getSalesAnalytics(sellerId, period);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid period parameter', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
