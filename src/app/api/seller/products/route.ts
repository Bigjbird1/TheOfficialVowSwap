import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ProductFormData } from '@/app/types/seller';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return new NextResponse('Seller account not found', { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { sellerId: user.seller.id },
      include: {
        category: true,
        bulkDiscounts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return new NextResponse('Seller account not found', { status: 404 });
    }

    const data: ProductFormData = await request.json();

    const product = await prisma.product.create({
      data: {
        sellerId: user.seller.id,
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        images: data.images,
        quantity: data.quantity,
        tags: data.tags,
        bulkDiscounts: {
          create: data.bulkDiscounts.map(discount => ({
            minQuantity: discount.minQuantity,
            discount: discount.discount,
          })),
        },
      },
      include: {
        category: true,
        bulkDiscounts: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Create Product Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return new NextResponse('Seller account not found', { status: 404 });
    }

    const { id, ...data }: ProductFormData & { id: string } = await request.json();

    const product = await prisma.product.update({
      where: {
        id,
        sellerId: user.seller.id, // Ensure seller owns the product
      },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        images: data.images,
        quantity: data.quantity,
        tags: data.tags,
        bulkDiscounts: {
          deleteMany: {},
          create: data.bulkDiscounts.map(discount => ({
            minQuantity: discount.minQuantity,
            discount: discount.discount,
          })),
        },
      },
      include: {
        category: true,
        bulkDiscounts: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update Product Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true },
    });

    if (!user?.seller) {
      return new NextResponse('Seller account not found', { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    await prisma.product.delete({
      where: {
        id,
        sellerId: user.seller.id, // Ensure seller owns the product
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
