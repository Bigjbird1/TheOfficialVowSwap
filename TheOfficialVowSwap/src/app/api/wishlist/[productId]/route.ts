import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { productId } = params;

  if (!productId) {
    return new NextResponse('Product ID is required', { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wishlist: true,
      },
    });

    if (!user?.wishlist) {
      return new NextResponse('Wishlist not found', { status: 404 });
    }

    // Delete the wishlist item
    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: user.wishlist.id,
        productId: productId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
