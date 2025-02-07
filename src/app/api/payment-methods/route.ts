import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      orderBy: {
        isDefault: 'desc'
      }
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, lastFour, isDefault } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // If this payment method is being set as default, unset any existing default
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type,
        lastFour,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error("Error creating payment method:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, type, lastFour, isDefault } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the payment method belongs to the user
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingPaymentMethod) {
      return new NextResponse("Payment method not found", { status: 404 });
    }

    // If this payment method is being set as default, unset any existing default
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: user.id,
          NOT: { id }
        },
        data: { isDefault: false }
      });
    }

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        type,
        lastFour,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error("Error updating payment method:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Payment method ID is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the payment method belongs to the user
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!paymentMethod) {
      return new NextResponse("Payment method not found", { status: 404 });
    }

    await prisma.paymentMethod.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
