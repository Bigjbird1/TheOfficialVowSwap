import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { 
  CreatePromotionRequest, 
  UpdatePromotionRequest, 
  PromotionResponse, 
  PromotionsListResponse 
} from '@/app/types/promotions';

// GET /api/seller/promotions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id }
    });

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const where = {
      sellerId: seller.id,
      ...(type && { type }),
      ...(isActive && { isActive: isActive === 'true' }),
    };

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        include: {
          couponCode: true,
          flashSale: {
            include: {
              products: true,
              category: true,
            },
          },
          bulkDiscount: {
            include: {
              product: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.promotion.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        promotions,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}

// POST /api/seller/promotions
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id }
    });

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    const data: CreatePromotionRequest = await req.json();
    
    const promotion = await prisma.promotion.create({
      data: {
        sellerId: seller.id,
        name: data.name,
        description: data.description,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: true,
        ...(data.couponCode && {
          couponCode: {
            create: {
              code: data.couponCode.code,
              discountType: data.couponCode.discountType,
              discountValue: data.couponCode.discountValue,
              minimumPurchase: data.couponCode.minimumPurchase,
              maxUses: data.couponCode.maxUses,
              perUserLimit: data.couponCode.perUserLimit,
            },
          },
        }),
        ...(data.flashSale && {
          flashSale: {
            create: {
              discountType: data.flashSale.discountType,
              discountValue: data.flashSale.discountValue,
              categoryId: data.flashSale.categoryId,
              products: {
                connect: data.flashSale.productIds.map(id => ({ id })),
              },
            },
          },
        }),
        ...(data.bulkDiscount && {
          bulkDiscount: {
            create: {
              productId: data.bulkDiscount.productId,
              minQuantity: data.bulkDiscount.minQuantity,
              discount: data.bulkDiscount.discount,
              isActive: true,
            },
          },
        }),
      },
      include: {
        couponCode: true,
        flashSale: {
          include: {
            products: true,
            category: true,
          },
        },
        bulkDiscount: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create promotion' },
      { status: 500 }
    );
  }
}

// PATCH /api/seller/promotions
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id }
    });

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    const data: UpdatePromotionRequest & { id: string } = await req.json();
    const { id, ...updateData } = data;

    const promotion = await prisma.promotion.findFirst({
      where: { id, sellerId: seller.id },
    });

    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Promotion not found' },
        { status: 404 }
      );
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
        ...(updateData.endDate && { endDate: new Date(updateData.endDate) }),
        ...(updateData.couponCode && {
          couponCode: {
            update: updateData.couponCode,
          },
        }),
        ...(updateData.flashSale && {
          flashSale: {
            update: {
              discountType: updateData.flashSale.discountType,
              discountValue: updateData.flashSale.discountValue,
              categoryId: updateData.flashSale.categoryId,
              products: {
                set: updateData.flashSale.productIds.map(id => ({ id })),
              },
            },
          },
        }),
        ...(updateData.bulkDiscount && {
          bulkDiscount: {
            update: {
              minQuantity: updateData.bulkDiscount.minQuantity,
              discount: updateData.bulkDiscount.discount,
              isActive: updateData.bulkDiscount.isActive,
            },
          },
        }),
      },
      include: {
        couponCode: true,
        flashSale: {
          include: {
            products: true,
            category: true,
          },
        },
        bulkDiscount: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPromotion,
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update promotion' },
      { status: 500 }
    );
  }
}

// DELETE /api/seller/promotions
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id }
    });

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    const { id } = await req.json();

    const promotion = await prisma.promotion.findFirst({
      where: { id, sellerId: seller.id },
    });

    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Promotion not found' },
        { status: 404 }
      );
    }

    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete promotion' },
      { status: 500 }
    );
  }
}
