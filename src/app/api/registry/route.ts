import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's registry with items and product details
    console.log('Fetching registry for user:', session.user.email);
    
    const registry = await prisma.Registry.findFirst({
      where: { 
        user: {
          email: session.user.email
        }
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

    if (!registry) {
      console.log('No registry found for user');
      return NextResponse.json({ registry: null });
    }

    console.log('Registry data to return:', { registry });
    
    return NextResponse.json({ registry });
  } catch (error) {
    console.error('Error fetching registry:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      rawError: error
    });
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, isPublic = true } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existingRegistry = await prisma.Registry.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (existingRegistry) {
      return NextResponse.json({ error: 'User already has a registry' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newRegistry = await prisma.Registry.create({
      data: {
        userId: user.id,
        name,
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

    return NextResponse.json(newRegistry);
  } catch (error) {
    console.error('Error creating registry:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();
    const { name, description, isPublic } = updates;

    const existingRegistry = await prisma.Registry.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!existingRegistry) {
      return NextResponse.json({ error: 'Registry not found' }, { status: 404 });
    }

    // Update registry
    const updatedRegistry = await prisma.Registry.update({
      where: {
        id: existingRegistry.id,
      },
      data: {
        ...(name && { name }),
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

    return NextResponse.json(updatedRegistry);
  } catch (error) {
    console.error('Error updating registry:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
