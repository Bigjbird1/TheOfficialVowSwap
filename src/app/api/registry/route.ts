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
    console.log('Fetching registry for user:', session.user.email);
    
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

    console.log('User registry data:', user?.registry);
    
    if (!user?.registry) {
      console.log('No registry found for user');
      return NextResponse.json({ registry: null });
    }

    // Test JSON serialization
    const testData = { test: 'valid json' };
    console.log('Test JSON serialization:', JSON.stringify(testData));

    const registryData = { registry: user.registry };
    console.log('Registry data to return:', registryData);
    
    return NextResponse.json(registryData);
  } catch (error) {
    console.error('Error fetching registry:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      rawError: error
    });
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
