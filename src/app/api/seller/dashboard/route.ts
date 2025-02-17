import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/auth.config';

interface OrderItemWithProductCategory {
  quantity: number;
  product: {
    price: number;
    category: string | null;
  };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          details: 'Please sign in to access the dashboard',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
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
          details: 'No seller account is associated with this user',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Default to one month ago if no date range is provided
    const startDate = startDateParam ? new Date(startDateParam) : oneMonthAgo;
    const endDate = endDateParam ? new Date(endDateParam) : now;

    // Ensure the dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid date range',
          details: 'The provided start or end date is invalid.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      // Get sales metrics
      const [dailySales, weeklySales, monthlySales, totalSales, salesByCategory] =
        await Promise.all([
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
          prisma.order.findMany({
            where: {
              sellerId: user.seller.id,
              createdAt: { gte: startDate, lte: endDate },
              status: { not: 'CANCELLED' },
            },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      price: true,
                      category: true,
                    },
                  },
                },
              },
            },
          }),
        ]);

      // Aggregate sales by category
      const categorySales: { [key: string]: number } = {};
      salesByCategory.forEach((order) => {
        order.items.forEach((item: OrderItemWithProductCategory) => {
          const categoryName = item.product.category || 'Uncategorized';
          categorySales[categoryName] =
            (categorySales[categoryName] || 0) +
            item.quantity * item.product.price;
        });
      });

      // Get product stats
      const [products, activeProducts, orders, pendingOrders, topProducts] =
        await Promise.all([
          prisma.product.count({
            where: { sellerId: user.seller.id },
          }),
          prisma.product.count({
            where: {
              sellerId: user.seller.id,
              isActive: true,
              quantity: { gt: 0 },
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

      // Customer Segmentation (New vs. Returning)
      const customerOrderCounts = await prisma.order.groupBy({
        by: ['userId'],
        where: {
          sellerId: user.seller.id,
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: {
          userId: true,
        },
      });

      let newCustomerRevenue = 0;
      let returningCustomerRevenue = 0;
      let newCustomerCount = 0;
      let returningCustomerCount = 0;

      customerOrderCounts.forEach((customer) => {
        if (customer._count.userId === 1) {
          newCustomerCount++;
          // Find one order from this customer to add to newCustomerRevenue
          const order = salesByCategory.find(order => order.userId === customer.userId);
          if(order) {
            newCustomerRevenue += order.totalAmount;
          }
        } else if (customer._count.userId > 1) {
          returningCustomerCount++;
          const orders = salesByCategory.filter(order => order.userId === customer.userId)
          orders.forEach(order => {
            returningCustomerRevenue += order.totalAmount;
          })
        }
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
            byCategory: categorySales,
          },
          topProducts,
          customerSegmentation: {
            newCustomers: newCustomerCount,
            returningCustomers: returningCustomerCount,
            newCustomerRevenue,
            returningCustomerRevenue,
          },
        },
        recentOrders,
      });
    } catch (dbError) {
      console.error('Database Operation Error:', {
        error:
          dbError instanceof Error ? dbError.message : 'Unknown database error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
        sellerId: user.seller.id,
        timestamp: new Date().toISOString(),
      });

      // Check for specific database errors
      if (dbError instanceof Error) {
        if (dbError.message.includes('Connection')) {
          return new NextResponse(
            JSON.stringify({
              error: 'Database connection error',
              details: 'Unable to fetch dashboard data. Please try again later.',
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        if (dbError.message.includes('Prisma')) {
          return new NextResponse(
            JSON.stringify({
              error: 'Data retrieval error',
              details:
                'There was an error fetching your dashboard data. Please try again.',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
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
      timestamp: new Date().toISOString(),
    });

    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        details:
          'An unexpected error occurred while loading the dashboard. Please try again later.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
