import ProductDetailsPage from "../../ProductDetailsPage"

interface Props {
  params: {
    id: string
  }
}

import { headers } from 'next/headers'

async function getProduct(id: string) {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3004'
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    
    const res = await fetch(`${protocol}://${host}/api/products/${id}`, {
      // Add cache: 'no-store' to prevent caching during development
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      },
      next: {
        revalidate: 0
      }
    })
    
    if (!res.ok) {
      throw new Error(`Failed to fetch product: ${res.statusText}`)
    }
    
    return res.json()
  } catch (error) {
    throw new Error(`Error loading product: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export default async function ProductPage({ params }: Props) {
  try {
    const product = await getProduct(params.id)
    return <ProductDetailsPage id={params.id} product={product} />
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
