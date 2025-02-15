import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { productId, quantity, priority = 0 } = await request.json();

    if (!productId || !quantity) {
      return new NextResponse('Product ID and quantity are required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        registry: true,
      },
    });

    if (!user?.registry) {
      return new NextResponse('Registry not found', { status: 404 });
    }

    // Check if item already exists
    const existingItem = await prisma.registryItem.findUnique({
      where: {
        registryId_productId: {
          registryId: user.registry.id,
          productId,
        },
      },
    });

    if (existingItem) {
      return new NextResponse('Item already exists in registry', { status: 400 });
    }

    // Add item to registry
    await prisma.registryItem.create({
      data: {
        registryId: user.registry.id,
        productId,
        quantity,
        priority,
      },
    });

    // Return updated registry
    const updatedRegistry = await prisma.registry.findUnique({
      where: {
        id: user.registry.id,
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

    return NextResponse.json(updatedRegistry);
  } catch (error) {
    console.error('Error adding to registry:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
