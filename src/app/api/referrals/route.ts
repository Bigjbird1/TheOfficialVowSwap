import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { ReferralStatus } from '@/app/types/loyalty';

// Generate or retrieve a referral link for the current user
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
      include: { referralLink: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return existing referral link if it exists
    if (user.referralLink) {
      return NextResponse.json({ data: user.referralLink });
    }

    // Generate new referral link
    const referralLink = await prisma.referralLink.create({
      data: {
        userId: user.id,
        code: nanoid(8), // Generate 8-character unique code
      }
    });

    return NextResponse.json({ data: referralLink });
  } catch (error) {
    console.error('Error in GET /api/referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Track referral link clicks and validate referral codes
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const referralLink = await prisma.referralLink.update({
      where: { code },
      data: { clickCount: { increment: 1 } },
      include: { user: true }
    });

    if (!referralLink) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      data: {
        referrerId: referralLink.userId,
        code: referralLink.code
      }
    });
  } catch (error) {
    console.error('Error in POST /api/referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
