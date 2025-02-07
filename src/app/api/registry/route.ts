import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Get user's registry with items and product details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        registry: {
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

    if (!user?.registry) {
      return NextResponse.json({ registry: null });
    }

    return NextResponse.json({ registry: user.registry });
  } catch (error) {
    console.error('Error fetching registry:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { title, eventDate, description, isPublic = true } = await request.json();

    if (!title || !eventDate) {
      return new NextResponse('Title and event date are required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        registry: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (user.registry) {
      return new NextResponse('User already has a registry', { status: 400 });
    }

    // Create new registry
    const registry = await prisma.registry.create({
      data: {
        userId: user.id,
        title,
        eventDate: new Date(eventDate),
        description,
        isPublic,
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

    return NextResponse.json(registry);
  } catch (error) {
    console.error('Error creating registry:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const updates = await request.json();
    const { title, eventDate, description, isPublic } = updates;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        registry: true,
      },
    });

    if (!user?.registry) {
      return new NextResponse('Registry not found', { status: 404 });
    }

    // Update registry
    const registry = await prisma.registry.update({
      where: {
        id: user.registry.id,
      },
      data: {
        ...(title && { title }),
        ...(eventDate && { eventDate: new Date(eventDate) }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
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

    return NextResponse.json(registry);
  } catch (error) {
    console.error('Error updating registry:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
