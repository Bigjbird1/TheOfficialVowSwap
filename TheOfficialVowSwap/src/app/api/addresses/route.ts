import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const addresses = await prisma.address.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      orderBy: {
        isDefault: 'desc'
      }
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
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
    const { street, city, state, zipCode, country, isDefault } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // If this address is being set as default, unset any existing default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error creating address:", error);
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
    const { id, street, city, state, zipCode, country, isDefault } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingAddress) {
      return new NextResponse("Address not found", { status: 404 });
    }

    // If this address is being set as default, unset any existing default
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          NOT: { id }
        },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error updating address:", error);
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
      return new NextResponse("Address ID is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the address belongs to the user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!address) {
      return new NextResponse("Address not found", { status: 404 });
    }

    await prisma.address.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting address:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
