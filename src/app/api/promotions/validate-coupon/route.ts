import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { ValidateCouponRequest, ValidateCouponResponse } from '@/app/types/promotions';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json<ValidateCouponResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data: ValidateCouponRequest = await req.json();
    const { code, userId, orderId, totalAmount } = data;

    // Find the coupon code
    const coupon = await prisma.couponCode.findUnique({
      where: { code },
      include: {
        promotion: true,
        usedCoupons: {
          where: { userId },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        data: {
          valid: false,
          message: 'Invalid coupon code',
          discountType: undefined,
          discount: undefined
        },
      });
    }

    // Check if the promotion is active and within date range
    const now = new Date();
    if (
      !coupon.promotion.isActive ||
      now < coupon.promotion.startDate ||
      now > coupon.promotion.endDate
    ) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        data: {
          valid: false,
          message: 'Coupon has expired or is not active',
          discountType: undefined,
          discount: undefined
        },
      });
    }

    // Check minimum purchase requirement
    if (coupon.minimumPurchase && totalAmount < coupon.minimumPurchase) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        data: {
          valid: false,
          message: `Minimum purchase amount of $${coupon.minimumPurchase} required`,
          discountType: undefined,
          discount: undefined
        },
      });
    }

    // Check maximum uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        data: {
          valid: false,
          message: 'Coupon has reached maximum usage limit',
          discountType: undefined,
          discount: undefined
        },
      });
    }

    // Check per-user limit
    if (
      coupon.perUserLimit &&
      coupon.usedCoupons.length >= coupon.perUserLimit
    ) {
      return NextResponse.json<ValidateCouponResponse>({
        success: true,
        data: {
          valid: false,
          message: 'You have reached the usage limit for this coupon',
          discountType: undefined,
          discount: undefined
        },
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (totalAmount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    // If orderId is provided, record the coupon usage
    if (orderId) {
      await prisma.$transaction([
        prisma.usedCoupon.create({
          data: {
            couponId: coupon.id,
            userId,
            orderId,
          },
        }),
        prisma.couponCode.update({
          where: { id: coupon.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    return NextResponse.json<ValidateCouponResponse>({
      success: true,
      data: {
        valid: true,
        discount,
        discountType: coupon.discountType,
        message: 'Coupon applied successfully',
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json<ValidateCouponResponse>(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
