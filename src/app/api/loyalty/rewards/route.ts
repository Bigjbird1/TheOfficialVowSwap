import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';
import { LoyaltyTransactionType, RewardStatus } from '@/app/types/loyalty';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json(
        { error: 'Reward ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { loyaltyPoints: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId }
    });

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    if (!reward.isActive) {
      return NextResponse.json(
        { error: 'This reward is no longer available' },
        { status: 400 }
      );
    }

    if (!user.loyaltyPoints) {
      return NextResponse.json(
        { error: 'No loyalty points record found' },
        { status: 404 }
      );
    }

    if (user.loyaltyPoints.points < reward.pointsCost) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Start a transaction to redeem the reward
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // Create redeemed reward record
      const redeemedReward = await tx.redeemedReward.create({
        data: {
          userId: user.id,
          rewardId: reward.id,
          pointsSpent: reward.pointsCost,
          status: RewardStatus.ACTIVE,
          expiresAt: reward.type === 'PERCENTAGE_DISCOUNT' || reward.type === 'FIXED_DISCOUNT'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry for discounts
            : null
        }
      });

      // Create loyalty transaction record
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          loyaltyPointsId: user.loyaltyPoints!.id,
          points: -reward.pointsCost,
          type: LoyaltyTransactionType.REWARD_REDEMPTION,
          description: `Redeemed ${reward.name}`
        }
      });

      // Update loyalty points
      const updatedPoints = await tx.loyaltyPoints.update({
        where: { id: user.loyaltyPoints!.id },
        data: {
          points: { decrement: reward.pointsCost }
        }
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'REWARD_REDEEMED',
          title: 'Reward Redeemed Successfully',
          message: `You have redeemed ${reward.name} for ${reward.pointsCost} points.`
        }
      });

      return {
        redeemedReward,
        remainingPoints: updatedPoints.points
      };
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in POST /api/loyalty/rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get available rewards for the current user
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
        loyaltyPoints: true,
        redeemedRewards: {
          include: { reward: true },
          where: { status: RewardStatus.ACTIVE }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all active rewards available for the user's tier
    const availableRewards = await prisma.loyaltyReward.findMany({
      where: {
        isActive: true,
        minTier: {
          in: getTiersForUser(user.loyaltyPoints?.tier || 'BRONZE')
        }
      }
    });

    return NextResponse.json({
      data: {
        availableRewards,
        activeRewards: user.redeemedRewards
      }
    });
  } catch (error) {
    console.error('Error in GET /api/loyalty/rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get available tiers for a user
function getTiersForUser(userTier: string): string[] {
  const tiers = ['BRONZE'];
  
  switch (userTier) {
    case 'PLATINUM':
      tiers.push('PLATINUM');
    case 'GOLD':
      tiers.push('GOLD');
    case 'SILVER':
      tiers.push('SILVER');
  }
  
  return tiers;
}
