import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { productId } = params;

  try {
    const { quantity, priority } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        registry: true,
      },
    });

    if (!user?.registry) {
      return new NextResponse('Registry not found', { status: 404 });
    }

    // Update registry item
    await prisma.registryItem.update({
      where: {
        registryId_productId: {
          registryId: user.registry.id,
          productId,
        },
      },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(priority !== undefined && { priority }),
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
    console.error('Error updating registry item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { productId } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        registry: true,
      },
    });

    if (!user?.registry) {
      return new NextResponse('Registry not found', { status: 404 });
    }

    // Delete registry item
    await prisma.registryItem.delete({
      where: {
        registryId_productId: {
          registryId: user.registry.id,
          productId,
        },
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
    console.error('Error deleting registry item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
