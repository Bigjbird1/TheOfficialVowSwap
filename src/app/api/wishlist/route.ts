import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Get user's wishlist with items and product details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wishlist: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user?.wishlist) {
      // Create wishlist if it doesn't exist
      const wishlist = await prisma.wishlist.create({
        data: {
          userId: user!.id,
          items: {
            create: [],
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                  description: true,
                },
              },
            },
          },
        },
      });
      return NextResponse.json({ items: wishlist.items });
    }

    return NextResponse.json({ items: user.wishlist.items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wishlist: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    let wishlist = user.wishlist;

    if (!wishlist) {
      // Create wishlist if it doesn't exist
      wishlist = await prisma.wishlist.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Add item to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(wishlistItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
