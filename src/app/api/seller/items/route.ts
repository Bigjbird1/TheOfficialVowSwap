import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth.config';

export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check if user is a seller
    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Unauthorized - Seller account required' },
        { status: 403 }
      );
    }

    // Get the seller record
    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id }
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    
    // Extract form fields
    const itemName = formData.get('itemName') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const quantity = parseInt(formData.get('inventory') as string) || 1;
    const discount = parseFloat(formData.get('discount') as string) || 0;
    
    // Validate required fields
    if (!itemName || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get images from form data
    const images = formData.getAll('images') as File[];
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // TODO: Process and upload images
    // For now, we'll store the image count as a placeholder
    const imageUrls = Array(images.length).fill('placeholder-url');

    // Create the listing in the database
    const listing = await prisma.product.create({
      data: {
        name: itemName,
        description,
        price,
        category,
        quantity, // Using quantity instead of inventory as per schema
        images: imageUrls,
        sellerId: seller.id, // Using the seller's ID from their profile
        isActive: true // Using isActive instead of status as per schema
      }
    });

    return NextResponse.json(
      { message: 'Listing created successfully', listing },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}