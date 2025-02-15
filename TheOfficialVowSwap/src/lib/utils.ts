import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "./prisma"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
};

export async function validateSellerAccess(): Promise<ApiResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'No session found'
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { seller: true }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'Invalid user'
      };
    }

    // Check for SELLER role (or ADMIN for oversight)
    if (!['SELLER', 'ADMIN'].includes(user.role)) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'Invalid role'
      };
    }

    if (!user.seller && user.role === 'SELLER') {
      return {
        success: false,
        message: 'Seller account not found',
        error: 'No seller profile'
      };
    }

    return {
      success: true,
      data: {
        user,
        seller: user.seller
      }
    };
  } catch (error) {
    console.error('Seller validation error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error
    };
  }
}

export function createApiResponse(
  success: boolean,
  data?: any,
  message?: string,
  status: number = 200
): NextResponse {
  if (!success) {
    return NextResponse.json(
      { success: false, message: message || 'Error occurred', error: data },
      { status: status || 500 }
    );
  }
  
  return NextResponse.json(
    { success: true, data, message },
    { status }
  );
}

export async function getSellerDetails(userId: string) {
  try {
    const seller = await prisma.seller.findFirst({
      where: { userId },
      include: {
        products: true,
        orders: true,
      },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    return seller;
  } catch (error) {
    console.error('Get seller details error:', error);
    throw error;
  }
}
