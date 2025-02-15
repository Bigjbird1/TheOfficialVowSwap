import ProductDetailsPage from "../../ProductDetailsPage"
import ProductClientLayout from "../client-layout"

interface Props {
  params: {
    id: string
  }
}

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock"

interface ApiProduct {
  id: string
  name: string
  price: number
  description: string
  quantity: number
  images: string[]
  seller?: {
    storeName: string
  }
}

async function getProduct(id: string) {
  try {
    // Use relative URL since we're on the same server
    const res = await fetch(`/api/products/${id}`, {
      // Add cache: 'no-store' to prevent caching during development
      cache: 'no-store'
    })
    
    if (!res.ok) {
      throw new Error(`Failed to fetch product: ${res.statusText}`)
    }
    
    const data: ApiProduct = await res.json()
    
    // Determine stock status based on quantity
    let stockStatus: StockStatus
    if (data.quantity > 10) {
      stockStatus = "In Stock"
    } else if (data.quantity > 0) {
      stockStatus = "Low Stock"
    } else {
      stockStatus = "Out of Stock"
    }
    
    // Transform API response to match ProductDetailsPage expected format
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description,
      category: "default", // Add default category if not provided by API
      rating: 5, // Add default rating if not provided by API
      reviewCount: 0, // Add default review count if not provided by API
      stockStatus,
      images: data.images ? data.images.map((url: string) => ({
        id: url,
        url: url,
        alt: data.name
      })) : [{
        id: "default",
        url: "/placeholder.svg",
        alt: data.name
      }],
      specifications: {
        condition: "New",
        materials: "Not specified",
        width: "Not specified",
        height: "Not specified",
        depth: "Not specified",
        weight: "Not specified"
      },
      shippingInfo: "Standard shipping available",
      sellerName: data.seller?.storeName || "Unknown Seller",
      sellerRating: 5 // Add default seller rating if not provided by API
    } as const
  } catch (error) {
    throw new Error(`Error loading product: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export default async function ProductPage({ params }: Props) {
  // Properly handle params as a Promise
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id
  
  if (!id) {
    throw new Error('Product ID is required')
  }

  try {
    const product = await getProduct(id)
    return (
      <ProductClientLayout>
        <ProductDetailsPage id={id} product={product} />
      </ProductClientLayout>
    )
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Product</h1>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'Failed to load product'}</p>
        </div>
      </div>
    )
  }
}
