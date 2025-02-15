import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const imageId = params.id;

  // In a real application, you would fetch image metadata from a database
  // based on the imageId.  For this example, we'll assume a simple
  // directory structure.

  // **IMPORTANT SECURITY NOTE:**
  // In a production environment, you MUST validate the imageId to prevent
  // directory traversal attacks.  This example does NOT include sufficient
  // validation for demonstration purposes.

  const imagePath = path.join(process.cwd(), 'public', 'uploads', imageId);

  try {
    const imageBuffer = await fs.readFile(imagePath);
    const contentType = 'image/jpeg'; // Or determine dynamically

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    // Handle file not found or other errors
    return new NextResponse('Image not found', { status: 404 });
  }
}