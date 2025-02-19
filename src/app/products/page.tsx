import { headers } from 'next/headers'
import ProductsClient from './products-client'
import { Product } from '../types'

// Products fetching function with improved error handling
async function getProducts(searchParams?: { [key: string]: string | string[] | undefined }): Promise<Product[]> {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3004'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  
  // Build URL with search params
  const url = new URL(`${protocol}://${host}/api/products`)
  if (searchParams) {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v))
      } else if (value !== undefined) {
        params.append(key, value)
      }
    })
    url.search = params.toString()
  }
  
  // Add timestamp to URL to prevent caching
  url.searchParams.append('_t', Date.now().toString())
  
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      next: {
        revalidate: 0 // Disable cache for real-time data
      }
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(errorData.error || `Failed to fetch products: ${res.status} ${res.statusText}`)
    }
    
    const data = await res.json()
    
    if (!Array.isArray(data.products)) {
      throw new Error('Invalid products data received from API')
    }
    
    return data.products as Product[]
  } catch (error) {
    console.error('Products fetch error:', error)
    // Return empty array instead of throwing to handle errors gracefully
    return []
  }
}

// Main page component (Server Component)
export default async function ProductsPage({
  searchParams = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const products = await getProducts(searchParams)
  
  return (
    <div className="container mx-auto px-2 py-4 bg-gray-50">
      <ProductsClient products={products} searchParams={searchParams} />
    </div>
  )
}
