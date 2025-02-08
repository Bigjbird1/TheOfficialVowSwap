import { headers } from 'next/headers'
import { ReadonlyURLSearchParams } from 'next/navigation'
import ProductsClient from './products-client'

// Products fetching function with improved error handling
async function getProducts(searchParams?: ReadonlyURLSearchParams) {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3004'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  
  // Build URL with search params
  const url = new URL(`${protocol}://${host}/api/products`)
  if (searchParams) {
    url.search = searchParams.toString()
  }
  
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
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
    
    return data.products
  } catch (error) {
    console.error('Products fetch error:', error)
    // Return empty array instead of throwing to handle errors gracefully
    return []
  }
}

// Main page component (Server Component)
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: ReadonlyURLSearchParams
}) {
  const products = await getProducts(searchParams)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductsClient products={products} searchParams={searchParams} />
    </div>
  )
}
