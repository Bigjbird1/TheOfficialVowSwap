import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          details: 'Please sign in to access the dashboard'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get seller data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return new NextResponse(
        JSON.stringify({
          error: 'Seller account not found',
          details: 'No seller account is associated with this user'
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      // Get sales metrics
      const [dailySales, weeklySales, monthlySales, totalSales] = await Promise.all([
        prisma.order.aggregate({
          where: {
            sellerId: user.seller.id,
            createdAt: { gte: startOfDay },
            status: { not: 'CANCELLED' },
          },
          _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
          where: {
            sellerId: user.seller.id,
            createdAt: { gte: oneWeekAgo },
            status: { not: 'CANCELLED' },
          },
          _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
          where: {
            sellerId: user.seller.id,
            createdAt: { gte: oneMonthAgo },
            status: { not: 'CANCELLED' },
          },
          _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
          where: {
            sellerId: user.seller.id,
            status: { not: 'CANCELLED' },
          },
          _sum: { totalAmount: true },
        }),
      ]);

      // Get product stats
      const [products, activeProducts, orders, pendingOrders, topProducts] = await Promise.all([
        prisma.product.count({
          where: { sellerId: user.seller.id },
        }),
        prisma.product.count({
          where: { 
            sellerId: user.seller.id,
            isActive: true,
            inventory: { gt: 0 },
          },
        }),
        prisma.order.count({
          where: { sellerId: user.seller.id },
        }),
        prisma.order.count({
          where: {
            sellerId: user.seller.id,
            status: 'PENDING',
          },
        }),
        prisma.product.findMany({
          where: { sellerId: user.seller.id },
          orderBy: { popularity: 'desc' },
          take: 5,
        }),
      ]);

      // Get recent orders
      const recentOrders = await prisma.order.findMany({
        where: { sellerId: user.seller.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      return NextResponse.json({
        seller: user.seller,
        stats: {
          totalProducts: products,
          activeProducts,
          totalOrders: orders,
          pendingOrders,
          revenue: {
            daily: dailySales._sum.totalAmount || 0,
            weekly: weeklySales._sum.totalAmount || 0,
            monthly: monthlySales._sum.totalAmount || 0,
            total: totalSales._sum.totalAmount || 0,
          },
          topProducts,
        },
        recentOrders,
      });
    } catch (dbError) {
      console.error('Database Operation Error:', {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
        sellerId: user.seller.id,
        timestamp: new Date().toISOString()
      });

      // Check for specific database errors
      if (dbError instanceof Error) {
        if (dbError.message.includes('Connection')) {
          return new NextResponse(
            JSON.stringify({
              error: 'Database connection error',
              details: 'Unable to fetch dashboard data. Please try again later.'
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        if (dbError.message.includes('Prisma')) {
          return new NextResponse(
            JSON.stringify({
              error: 'Data retrieval error',
              details: 'There was an error fetching your dashboard data. Please try again.'
            }),
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      throw dbError; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Dashboard Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        details: 'An unexpected error occurred while loading the dashboard. Please try again later.'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
