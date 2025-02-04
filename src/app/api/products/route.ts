import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  stockStatus: string;
  images: ProductImage[];
  specifications: {
    "Dimensions"?: string;
    "Material"?: string;
    "Style"?: string;
    "Bulb Type"?: string;
    "Number of Lights"?: string;
    "Installation"?: string;
    "Assembly"?: string;
    "Weight"?: string;
    "Finish"?: string;
    "Table Runner Length"?: string;
    "Charger Plate Diameter"?: string;
    "Color"?: string;
    "Pieces per Set"?: string;
    [key: string]: string | undefined;
  };
  shippingInfo: string;
  sellerName: string;
  sellerRating: number;
}

// Mock data matching the structure used in [id]/route.ts
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
  {
    id: "2",
    name: "Rustic Wooden Arch",
    price: 499.99,
    description: "Create a stunning focal point for your ceremony with this handcrafted wooden arch. Perfect for outdoor or indoor weddings, this versatile piece can be decorated with flowers, fabric, or lights to match your theme.",
    category: "Decorations",
    rating: 4.9,
    reviewCount: 89,
    stockStatus: "In Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Arch front view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Arch side view" },
      { id: "3", url: "/placeholder.svg?height=600&width=600", alt: "Arch detail view" },
      { id: "4", url: "/placeholder.svg?height=600&width=600", alt: "Arch in setting" }
    ],
    specifications: {
      "Dimensions": "80\" x 60\" x 90\"",
      "Material": "Solid Wood",
      "Style": "Rustic",
      "Assembly": "Required",
      "Weight": "45 lbs",
      "Finish": "Natural Wood Stain"
    },
    shippingInfo: "Free shipping on orders over $500. Estimated delivery: 7-10 business days",
    sellerName: "Rustic Wedding Essentials",
    sellerRating: 4.8
  },
  {
    id: "3",
    name: "Elegant Table Decor Set",
    price: 89.99,
    description: "Complete table setting package including premium table runners, charger plates, and coordinated place card holders. Creates a cohesive, sophisticated look for your reception tables.",
    category: "Table Settings",
    rating: 4.7,
    reviewCount: 234,
    stockStatus: "Low Stock",
    images: [
      { id: "1", url: "/placeholder.svg?height=600&width=600", alt: "Table setting front view" },
      { id: "2", url: "/placeholder.svg?height=600&width=600", alt: "Table setting overhead view" },
      { id: "3", url: "/placeholder.svg?height=600&width=600", alt: "Place setting detail" },
      { id: "4", url: "/placeholder.svg?height=600&width=600", alt: "Full table arrangement" }
    ],
    specifications: {
      "Table Runner Length": "108\"",
      "Charger Plate Diameter": "13\"",
      "Material": "Mixed Materials",
      "Style": "Modern Elegant",
      "Color": "Gold/Ivory",
      "Pieces per Set": "12"
    },
    shippingInfo: "Standard shipping: $12.99. Estimated delivery: 3-5 business days",
    sellerName: "Luxe Wedding Collections",
    sellerRating: 4.6
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get search params
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const sort = searchParams.get('sort');
    
    // Filter products based on category and search term if provided
    let filteredProducts = [...products];
    
    // Only filter by category if it's not "All"
    if (category && category !== "All") {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Search in name, description, and category
    if (search) {
      const searchTerms = search.split(' ').filter(term => term.length > 0);
      filteredProducts = filteredProducts.filter(product => {
        const searchableText = `
          ${product.name.toLowerCase()} 
          ${product.description.toLowerCase()} 
          ${product.category.toLowerCase()}
        `;
        return searchTerms.every(term => searchableText.includes(term));
      });
    }
    
    // Sort products if sort parameter is provided
    if (sort) {
      switch (sort) {
        case 'price-asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => {
            // Sort by rating first, then by review count for equal ratings
            if (b.rating === a.rating) {
              return b.reviewCount - a.reviewCount;
            }
            return b.rating - a.rating;
          });
          break;
      }
    }

    return NextResponse.json({
      products: filteredProducts,
      total: filteredProducts.length,
      filters: {
        category,
        search,
        sort
      }
    });
  } catch (error) {
    console.error('Error processing products request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
