import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';
import { LoyaltyTier, LoyaltyTransactionType, RewardStatus } from '@/app/types/loyalty';

// Get user's loyalty points and available rewards
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        loyaltyPoints: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create loyalty points record if it doesn't exist
    let loyaltyPoints = user.loyaltyPoints;
    if (!loyaltyPoints) {
      loyaltyPoints = await prisma.loyaltyPoints.create({
        data: {
          userId: user.id,
          tier: LoyaltyTier.BRONZE
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });
    }

    // Get available rewards based on user's tier
    const availableRewards = await prisma.loyaltyReward.findMany({
      where: {
        isActive: true,
        minTier: {
          in: getTiersForUser(loyaltyPoints.tier)
        }
      }
    });

    return NextResponse.json({
      data: {
        points: loyaltyPoints,
        availableRewards
      }
    });
  } catch (error) {
    console.error('Error in GET /api/loyalty:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Record loyalty points transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { points, type, description, orderId } = await request.json();

    if (!points || !type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { loyaltyPoints: true }
    });

    if (!user?.loyaltyPoints) {
      return NextResponse.json(
        { error: 'Loyalty points record not found' },
        { status: 404 }
      );
    }

    // Start a transaction to update points and create transaction record
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // Create transaction record
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          loyaltyPointsId: user.loyaltyPoints!.id,
          points,
          type: type as LoyaltyTransactionType,
          description,
          orderId
        }
      });

      // Update loyalty points
      const updatedPoints = await tx.loyaltyPoints.update({
        where: { id: user.loyaltyPoints!.id },
        data: {
          points: { increment: points },
          lifetimePoints: { increment: points > 0 ? points : 0 },
          // Update tier based on lifetime points
          tier: calculateNewTier(user.loyaltyPoints!.lifetimePoints + (points > 0 ? points : 0))
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      return { transaction, points: updatedPoints };
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in POST /api/loyalty:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get available tiers for a user
function getTiersForUser(userTier: LoyaltyTier): LoyaltyTier[] {
  const tiers = [LoyaltyTier.BRONZE];
  
  switch (userTier) {
    case LoyaltyTier.PLATINUM:
      tiers.push(LoyaltyTier.PLATINUM);
    case LoyaltyTier.GOLD:
      tiers.push(LoyaltyTier.GOLD);
    case LoyaltyTier.SILVER:
      tiers.push(LoyaltyTier.SILVER);
  }
  
  return tiers;
}

// Helper function to calculate new tier based on lifetime points
function calculateNewTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= 10000) return LoyaltyTier.PLATINUM;
  if (lifetimePoints >= 5000) return LoyaltyTier.GOLD;
  if (lifetimePoints >= 1000) return LoyaltyTier.SILVER;
  return LoyaltyTier.BRONZE;
}
