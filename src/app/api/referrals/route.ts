import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { ReferralLinkResponse } from '@/app/types/loyalty';
import { nanoid } from 'nanoid';

// Generate or retrieve referral link for authenticated user
export async function GET(
  req: NextRequest
): Promise<NextResponse<ReferralLinkResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        referralLink: {
          include: {
            referrals: true,
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

    // If user already has a referral link, return it
    if (user.referralLink) {
      return NextResponse.json({
        success: true,
        data: user.referralLink,
      });
    }

    // Generate new referral link
    const referralLink = await prisma.referralLink.create({
      data: {
        userId: user.id,
        code: nanoid(8), // Generate 8-character unique code
      },
      include: {
        referrals: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: referralLink,
    });
  } catch (error) {
    console.error('Error in referrals GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Track referral click
export async function POST(
  req: NextRequest
): Promise<NextResponse<ReferralLinkResponse>> {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Find and update referral link click count
    const referralLink = await prisma.referralLink.update({
      where: { code },
      data: {
        clickCount: {
          increment: 1,
        },
      },
      include: {
        referrals: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: referralLink,
    });
  } catch (error) {
    console.error('Error in referrals POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
