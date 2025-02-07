import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { LoyaltyPointsResponse, LoyaltyTier, LoyaltyTransactionType } from '@/app/types/loyalty';

// Helper function to calculate loyalty tier based on lifetime points
function calculateTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= 10000) return LoyaltyTier.PLATINUM;
  if (lifetimePoints >= 5000) return LoyaltyTier.GOLD;
  if (lifetimePoints >= 2000) return LoyaltyTier.SILVER;
  return LoyaltyTier.BRONZE;
}

// Get user's loyalty points and available rewards
export async function GET(
  req: NextRequest
): Promise<NextResponse<LoyaltyPointsResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        loyaltyPoints: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If user doesn't have loyalty points record, create one
    if (!user.loyaltyPoints) {
      const loyaltyPoints = await prisma.loyaltyPoints.create({
        data: {
          userId: user.id,
          points: 0,
          lifetimePoints: 0,
          tier: LoyaltyTier.BRONZE,
        },
        include: {
          transactions: true,
        },
      });

      // Get available rewards for the user's tier
      const availableRewards = await prisma.loyaltyReward.findMany({
        where: {
          isActive: true,
          minTier: {
            in: [LoyaltyTier.BRONZE],
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          points: loyaltyPoints,
          availableRewards,
        },
      });
    }

    // Get available rewards for the user's tier
    const availableRewards = await prisma.loyaltyReward.findMany({
      where: {
        isActive: true,
        minTier: {
          in: [
            LoyaltyTier.BRONZE,
            ...(user.loyaltyPoints.tier === LoyaltyTier.SILVER ? [LoyaltyTier.SILVER] : []),
            ...(user.loyaltyPoints.tier === LoyaltyTier.GOLD ? [LoyaltyTier.SILVER, LoyaltyTier.GOLD] : []),
            ...(user.loyaltyPoints.tier === LoyaltyTier.PLATINUM ? [LoyaltyTier.SILVER, LoyaltyTier.GOLD, LoyaltyTier.PLATINUM] : []),
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        points: user.loyaltyPoints,
        availableRewards,
      },
    });
  } catch (error) {
    console.error('Error in loyalty GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add loyalty points transaction
export async function POST(
  req: NextRequest
): Promise<NextResponse<LoyaltyPointsResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { points, type, description, orderId } = await req.json();

    if (!points || !type || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        loyaltyPoints: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create or update loyalty points
    const updatedLoyaltyPoints = await prisma.loyaltyPoints.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        points: points,
        lifetimePoints: points > 0 ? points : 0,
        tier: calculateTier(points > 0 ? points : 0),
        transactions: {
          create: {
            points,
            type: type as LoyaltyTransactionType,
            description,
            orderId,
          },
        },
      },
      update: {
        points: {
          increment: points,
        },
        lifetimePoints: {
          increment: points > 0 ? points : 0,
        },
        tier: calculateTier(
          (user.loyaltyPoints?.lifetimePoints || 0) + (points > 0 ? points : 0)
        ),
        transactions: {
          create: {
            points,
            type: type as LoyaltyTransactionType,
            description,
            orderId,
          },
        },
      },
      include: {
        transactions: true,
      },
    });

    // Get available rewards for the updated tier
    const availableRewards = await prisma.loyaltyReward.findMany({
      where: {
        isActive: true,
        minTier: {
          in: [
            LoyaltyTier.BRONZE,
            ...(updatedLoyaltyPoints.tier === LoyaltyTier.SILVER ? [LoyaltyTier.SILVER] : []),
            ...(updatedLoyaltyPoints.tier === LoyaltyTier.GOLD ? [LoyaltyTier.SILVER, LoyaltyTier.GOLD] : []),
            ...(updatedLoyaltyPoints.tier === LoyaltyTier.PLATINUM ? [LoyaltyTier.SILVER, LoyaltyTier.GOLD, LoyaltyTier.PLATINUM] : []),
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        points: updatedLoyaltyPoints,
        availableRewards,
      },
    });
  } catch (error) {
    console.error('Error in loyalty POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
