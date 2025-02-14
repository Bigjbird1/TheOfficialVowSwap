"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { Product } from "../types"

interface ProductGridProps {
  products: Product[]
  itemsPerPage?: number
  showPagination?: boolean
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

function StarRating({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex" role="img" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

// Debounce function for scroll handling
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function ProductGrid({ 
  products, 
  itemsPerPage = 12,
  showPagination = true,
  className = "",
  isLoading = false,
  filters
}: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  
  // Filter products based on filter criteria
  const filteredProducts = products.filter(product => {
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

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters?.sort) {
      switch (filters.sort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0; // 'newest' or default case
      }
    }
    return 0;
  });

  // Calculate pagination values
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = sortedProducts.slice(startIndex, endIndex)

  // Optimized scroll handler with debounce
  const handleScroll = useCallback(debounce(() => {
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
    
    if (isVisible) {
      gridRef.current.style.willChange = 'transform';
    } else {
      gridRef.current.style.willChange = 'auto';
    }
  }, 100), []);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productId = entry.target.getAttribute('data-product-id');
            if (productId) {
              setVisibleItems((prev) => new Set(prev).add(productId));
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Attach scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Smooth scroll to top with RAF for performance
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      
      const start = window.pageYOffset;
      const target = 0;
      const duration = 500;
      let startTime: number | null = null;

      const animateScroll = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = (currentTime - startTime) / duration;
        
        if (progress < 1) {
          const ease = easeOutCubic(progress);
          const currentPosition = start + (target - start) * ease;
          window.scrollTo(0, currentPosition);
          requestAnimationFrame(animateScroll);
        } else {
          window.scrollTo(0, target);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  // Easing function for smooth scroll
  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };

  if (isLoading) {
    return (
      <div 
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}
        style={{ contain: 'content' }}
      >
        {[...Array(itemsPerPage)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <div 
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        role="grid"
        aria-label="Products grid"
        style={{ 
          transform: 'translateZ(0)',
          willChange: 'transform',
          contain: 'content'
        }}
      >
        {currentProducts.map((product) => (
          <div 
            key={product.id}
            data-product-id={product.id}
            className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
            role="gridcell"
            style={{ contain: 'layout style paint' }}
          >
            <div className="relative">
              <Link 
                href={`/product/${product.id}`}
                className="block focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-lg"
              >
                <div 
                  className="aspect-[4/5] relative rounded-lg overflow-hidden mb-4 bg-gray-50"
                  style={{ willChange: 'transform' }}
                >
                  <Image
                    src={product.images[0]?.url || "/placeholder.svg"}
                    alt={product.images[0]?.alt || `Product image of ${product.name}`}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ 
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
                    }}
                  />
                </div>
              </Link>
              
              {/* Quick View Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-50 pointer-events-auto">
                <div className="bg-white rounded-lg p-4 w-11/12 max-w-sm space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Quick View
                  </h3>
                  <AddToCartButton product={product} className="w-full" />
                  <Link
                    href={`/product/${product.id}`}
                    className="block w-full text-center bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
              <h3 className="font-medium text-lg mb-2 line-clamp-2 text-gray-800 group-hover:text-pink-600 transition-colors duration-200">
                {product.name}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p 
                    className="text-xl font-semibold text-gray-900" 
                    aria-label={`Price: $${product.price.toFixed(2)}`}
                  >
                    ${product.price.toFixed(2)}
                  </p>
                  <span className="text-sm font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={product.rating} />
                    {product.rating && (
                      <span className="text-sm font-medium text-gray-700">
                        {product.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {product.reviewCount !== undefined && (
                    <span className="text-sm text-gray-500 border-l border-gray-200 pl-2">
                      {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <span 
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      product.stockStatus === "In Stock" 
                        ? "bg-green-50 text-green-700" 
                        : "bg-orange-50 text-orange-700"
                    }`}
                    role="status"
                  >
                    {product.stockStatus}
                  </span>
                </div>
              </div>
              <AddToCartButton product={product} />
          </div>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <nav 
          className="mt-6 flex items-center justify-center gap-4" 
          aria-label="Pagination"
          style={{ contain: 'content' }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-gray-600" role="status" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Next page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </nav>
      )}
    </div>
  )
}

function AddToCartButton({ product, className }: { product: Product; className?: string }) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || "/placeholder.svg"
    })
  }

  return (
    <button
      onClick={handleAddToCart}
      className="absolute bottom-4 right-4 p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg"
      aria-label={`Add ${product.name} to cart`}
      style={{ willChange: 'transform' }}
    >
      <ShoppingCart className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}
