import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { StorefrontUpdateData } from '@/app/types/seller';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/seller/storefront
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const seller = await prisma.seller.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({
      bannerImage: seller.bannerImage,
      logoImage: seller.logoImage,
      themeColor: seller.themeColor,
      accentColor: seller.accentColor,
      fontFamily: seller.fontFamily,
      layout: seller.layout,
      socialLinks: seller.socialLinks,
      businessHours: seller.businessHours,
      policies: seller.policies
    });
  } catch (error) {
    console.error('Error fetching storefront:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/seller/storefront
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData: StorefrontUpdateData = await request.json();

    const seller = await prisma.seller.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: seller.id },
      data: {
        bannerImage: updateData.bannerImage,
        logoImage: updateData.logoImage,
        themeColor: updateData.themeColor,
        accentColor: updateData.accentColor,
        fontFamily: updateData.fontFamily,
        layout: updateData.layout as any,
        socialLinks: updateData.socialLinks as any,
        businessHours: updateData.businessHours as any,
        policies: updateData.policies as any
      }
    });

    return NextResponse.json(updatedSeller);
  } catch (error) {
    console.error('Error updating storefront:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
