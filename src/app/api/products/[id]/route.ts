import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock data for demonstration purposes
const products = [
  {
    id: "1",
    name: "Vintage Vases",
    price: 129,
    description: "Beautiful vintage vases perfect for wedding centerpieces and decor. Each piece is unique with hand-painted floral designs.",
    category: "Decor",
    rating: 4.8,
    reviewCount: 156,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Vase front view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Vase side view" }
    ],
    specifications: {
      "condition": "Excellent",
      "height": "12 inches",
      "width": "8 inches",
      "materials": "Ceramic",
      "style": "Vintage",
      "color": "Ivory"
    },
    shippingInfo: "Free shipping. Estimated delivery: 3-5 business days",
    sellerName: "Vintage Treasures",
    sellerRating: 4.9
  },
  {
    id: "2",
    name: "Crystal Chandeliers",
    price: 299,
    description: "Elegant crystal chandeliers to add sparkle and sophistication to your wedding venue.",
    category: "Lighting",
    rating: 4.7,
    reviewCount: 92,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Chandelier front view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Chandelier detail" }
    ],
    specifications: {
      "condition": "Excellent",
      "height": "36 inches",
      "width": "24 inches",
      "materials": "Crystal, Metal",
      "style": "Modern",
      "bulbType": "E12 LED"
    },
    shippingInfo: "Free shipping. Estimated delivery: 5-7 business days",
    sellerName: "Elegant Lighting Co.",
    sellerRating: 4.8
  },
  {
    id: "3",
    name: "Table Runners",
    price: 49,
    description: "Handcrafted lace table runners to add a touch of elegance to your reception tables.",
    category: "Decor",
    rating: 4.9,
    reviewCount: 78,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Table runner full view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Table runner detail" }
    ],
    specifications: {
      "condition": "Excellent",
      "length": "108 inches",
      "width": "14 inches",
      "materials": "Cotton Lace",
      "style": "Victorian",
      "color": "Ivory"
    },
    shippingInfo: "Standard shipping: 3-5 business days",
    sellerName: "Lace & Linens",
    sellerRating: 5.0
  },
  {
    id: "4",
    name: "Floral Arrangements",
    price: 199,
    description: "Luxurious floral arrangements for centerpieces and venue decor.",
    category: "Decor",
    rating: 4.8,
    reviewCount: 120,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Floral arrangement front view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Floral arrangement detail" }
    ],
    specifications: {
      "condition": "Excellent",
      "height": "18 inches",
      "width": "12 inches",
      "materials": "Fresh Flowers, Greenery",
      "style": "Modern",
      "color": "Various"
    },
    shippingInfo: "Free shipping. Estimated delivery: 2-3 business days",
    sellerName: "Blooms & Beyond",
    sellerRating: 4.9
  },
  {
    id: "5",
    name: "LED Curtains",
    price: 149,
    description: "Stunning LED curtains to create magical lighting effects for your wedding venue.",
    category: "Lighting",
    rating: 4.7,
    reviewCount: 85,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "LED curtain full view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "LED curtain detail" }
    ],
    specifications: {
      "condition": "Excellent",
      "height": "96 inches",
      "width": "48 inches",
      "materials": "LED Lights, Fabric",
      "style": "Modern",
      "color": "RGB"
    },
    shippingInfo: "Free shipping. Estimated delivery: 5-7 business days",
    sellerName: "Lighting Magic",
    sellerRating: 4.8
  },
  {
    id: "6",
    name: "Rustic Signs",
    price: 79,
    description: "Handcrafted rustic signs perfect for wedding welcome signs and table numbers.",
    category: "Decor",
    rating: 4.9,
    reviewCount: 95,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Sign front view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Sign detail" }
    ],
    specifications: {
      "condition": "Excellent",
      "height": "24 inches",
      "width": "18 inches",
      "materials": "Reclaimed Wood",
      "style": "Rustic",
      "color": "Natural Wood"
    },
    shippingInfo: "Standard shipping: 3-5 business days",
    sellerName: "Rustic Creations",
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
