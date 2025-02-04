import { NextResponse } from 'next/server';

// Mock data for demonstration purposes
const products = [
  {
    id: "1",
    name: "Vintage Crystal Chandelier",
    price: 299.99,
    description: "Add elegance to your wedding venue with this stunning vintage-inspired crystal chandelier. Perfect for creating a romantic atmosphere with its warm, sparkling illumination. Each piece is carefully crafted with premium materials.",
    category: "Lighting",
    rating: 4.8,
    reviewCount: 156,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Chandelier front view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Chandelier side view" },
      { id: "3", url: "/placeholder.svg?height=600&width=600", alt: "Chandelier detail view" },
      { id: "4", url: "/placeholder.svg?height=600&width=600", alt: "Chandelier in setting" }
    ],
    specifications: {
      "Dimensions": "24\" x 24\" x 28\"",
      "Material": "Crystal, Metal",
      "Style": "Vintage",
      "Bulb Type": "E12 LED Compatible",
      "Number of Lights": "8",
      "Installation": "Professional Required"
    },
    shippingInfo: "Free shipping on orders over $500. Estimated delivery: 5-7 business days",
    sellerName: "Elegant Wedding Decor Co.",
    sellerRating: 4.9
  },
  // Add more products as needed
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = products.find(p => p.id === params.id);

  if (product) {
    return NextResponse.json(product);
  } else {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
}
