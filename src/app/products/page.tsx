import ProductGrid from "../components/ProductGrid"
import FilterBar from "../components/FilterBar"
import { headers } from 'next/headers'
import { ReadonlyURLSearchParams } from 'next/navigation'

async function getProducts(searchParams?: ReadonlyURLSearchParams) {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3004'
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    
    // Build URL with search params
    const url = new URL(`${protocol}://${host}/api/products`)
    if (searchParams) {
      url.search = searchParams.toString()
    }
    
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      },
      next: {
        revalidate: 0
      }
    })
    
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`)
    }
    
    const data = await res.json()
    return data.products
  } catch (error) {
    throw new Error(`Error loading products: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: ReadonlyURLSearchParams
}) {
  const products = await getProducts(searchParams)
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <FilterBar />
      
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-4">All Wedding Decor</h1>
        <p className="text-gray-600">
          Browse our collection of beautiful wedding decorations and find the perfect pieces for your special day.
        </p>
      </div>
      
      <ProductGrid products={products} />
    </div>
  )
}
