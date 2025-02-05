import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
      "condition": "Excellent",
      "width": "24 inches",
      "height": "28 inches",
      "depth": "24 inches",
      "weight": "15 lbs",
      "materials": "Crystal, Metal, Brass",
      "preservationStatus": "Excellent",
      "preservationDetails": "Original finish intact, all crystal pieces present and pristine",
      "style": "Vintage",
      "bulbType": "E12 LED Compatible",
      "numberOfLights": "8",
      "installation": "Professional Required"
    },
    shippingInfo: "Free shipping on orders over $500. Estimated delivery: 5-7 business days",
    sellerName: "Elegant Wedding Decor Co.",
    sellerRating: 4.9
  },
  {
    id: "2",
    name: "Antique Lace Table Runner",
    price: 89.99,
    description: "Beautiful hand-crafted lace table runner, perfect for adding a touch of vintage elegance to your wedding reception tables.",
    category: "Table Decor",
    rating: 4.7,
    reviewCount: 92,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Table runner full view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Table runner detail" }
    ],
    specifications: {
      "condition": "Very Good",
      "length": "108 inches",
      "width": "14 inches",
      "materials": "Cotton Lace",
      "style": "Victorian",
      "color": "Ivory"
    },
    shippingInfo: "Standard shipping: 3-5 business days",
    sellerName: "Vintage Treasures",
    sellerRating: 4.8
  },
  {
    id: "3",
    name: "Art Deco Wedding Arch",
    price: 449.99,
    description: "Stunning geometric wedding arch with intricate Art Deco patterns. Perfect for creating an unforgettable ceremony backdrop.",
    category: "Ceremony Decor",
    rating: 4.9,
    reviewCount: 78,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Arch front view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Arch detail" },
      { id: "3", url: "/placeholder.svg?height=600&width=600", alt: "Arch in setting" }
    ],
    specifications: {
      "condition": "Excellent",
      "height": "8 feet",
      "width": "6 feet",
      "depth": "3 feet",
      "weight": "45 lbs",
      "materials": "Metal, Gold Finish",
      "style": "Art Deco",
      "assembly": "Professional Assembly Available"
    },
    shippingInfo: "Free shipping. Estimated delivery: 7-10 business days",
    sellerName: "Deco Wedding Designs",
    sellerRating: 5.0
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = products.find(p => p.id === params.id);

  if (product) {
    return NextResponse.json(product);
  } else {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
}
