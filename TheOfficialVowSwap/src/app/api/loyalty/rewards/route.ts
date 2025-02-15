import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { RedeemRewardRequest, RedeemRewardResponse, RewardStatus } from '@/app/types/loyalty';

// Get all available rewards
export async function GET(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rewards = await prisma.loyaltyReward.findMany({
      where: {
        isActive: true,
      },
      include: {
        redemptions: {
          where: {
            status: RewardStatus.ACTIVE,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    console.error('Error in rewards GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Redeem a reward
export async function POST(
  req: NextRequest
): Promise<NextResponse<RedeemRewardResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rewardId }: RedeemRewardRequest = await req.json();

    if (!rewardId) {
      return NextResponse.json(
        { success: false, error: 'Reward ID is required' },
        { status: 400 }
      );
    }

    // Get user and their loyalty points
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        loyaltyPoints: true,
      },
    });

    if (!user || !user.loyaltyPoints) {
      return NextResponse.json(
        { success: false, error: 'User loyalty points not found' },
        { status: 404 }
      );
    }

    // Get the reward
    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { success: false, error: 'Reward not found' },
        { status: 404 }
      );
    }

    // Validate reward is active and user has enough points
    if (!reward.isActive) {
      return NextResponse.json(
        { success: false, error: 'This reward is no longer available' },
        { status: 400 }
      );
    }

    if (user.loyaltyPoints.points < reward.pointsCost) {
      return NextResponse.json(
        { success: false, error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Validate user's tier meets minimum requirement
    if (user.loyaltyPoints.tier < reward.minTier) {
      return NextResponse.json(
        { success: false, error: 'Your loyalty tier is not high enough for this reward' },
        { status: 400 }
      );
    }

    // Create redemption and update points in a transaction
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Create the redemption
      const redeemedReward = await tx.redeemedReward.create({
        data: {
          userId: user.id,
          rewardId: reward.id,
          pointsSpent: reward.pointsCost,
          status: RewardStatus.ACTIVE,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
        },
      });

      // Deduct points and create transaction record
      const updatedPoints = await tx.loyaltyPoints.update({
        where: { userId: user.id },
        data: {
          points: {
            decrement: reward.pointsCost,
          },
          transactions: {
            create: {
              points: -reward.pointsCost,
              type: 'REWARD_REDEMPTION',
              description: `Redeemed ${reward.name}`,
            },
          },
        },
      });

      return { redeemedReward, remainingPoints: updatedPoints.points };
    });

    return NextResponse.json({
      success: true,
      data: {
        redeemedReward: result.redeemedReward,
        remainingPoints: result.remainingPoints,
      },
    });
  } catch (error) {
    console.error('Error in rewards POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
