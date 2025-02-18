"use client"

import { useCallback, useEffect, useState } from "react"
import { Product } from "../types"
import VirtualGrid from "./ui/VirtualGrid"
import { useBreakpoint } from "../hooks/useBreakpoint"
import ProductCard from "./ProductCard"

interface ProductGridProps {
  products: Product[]
  className?: string
  isLoading?: boolean
  filters?: {
    category: string;
    subcategory: string;
    size: string;
    color: string;
    condition: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
    onSale: boolean;
  };
}

export default function ProductGrid({ 
  products,
  className = "",
  isLoading = false,
  filters
}: ProductGridProps) {
  const breakpoint = useBreakpoint()
  const [columnCount, setColumnCount] = useState(4)
  
  // Update column count based on breakpoint
  useEffect(() => {
    switch (breakpoint.breakpoint) {
      case 'sm':
        setColumnCount(1)
        break
      case 'md':
        setColumnCount(2)
        break
      case 'lg':
        setColumnCount(3)
        break
      default:
        setColumnCount(4)
    }
  }, [breakpoint.breakpoint])

  // Filter and sort products
  const processedProducts = products.filter(product => {
    if (filters) {
      if (filters.category && filters.category !== "" && 
          product.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
      
      if (filters.size && filters.size !== "" && 
          product.size?.toLowerCase() !== filters.size.toLowerCase()) {
        return false;
      }
      
      if (filters.color && filters.color !== "" && 
          product.color?.toLowerCase() !== filters.color.toLowerCase()) {
        return false;
      }
      
      if (filters.condition && filters.condition !== "" && 
          product.condition?.toLowerCase() !== filters.condition.toLowerCase()) {
        return false;
      }
      
      if (filters.minPrice && parseFloat(filters.minPrice) > product.price) {
        return false;
      }
      
      if (filters.maxPrice && parseFloat(filters.maxPrice) < product.price) {
        return false;
      }
    }
    
    return true;
  });

  const renderProduct = useCallback((product: Product) => {
    return <ProductCard product={product} />;
  }, []);

  if (isLoading) {
    return (
      <div className={className}>
        <VirtualGrid
          items={Array(12).fill(null)}
          columnCount={columnCount}
          renderItem={() => (
            <div className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          )}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <VirtualGrid
        items={processedProducts}
        columnCount={columnCount}
        renderItem={renderProduct}
        rowHeight={450}
      />
    </div>
  )
}
