"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { useCart } from "../contexts/CartContext"

interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  rating?: number
  reviewCount?: number
  stockStatus: string
  images: {
    id: string
    url: string
    alt: string
  }[]
  specifications: {
    [key: string]: string | undefined
  }
  shippingInfo: string
  sellerName: string
  sellerRating: number
}

interface ProductGridProps {
  products: Product[]
  itemsPerPage?: number
  showPagination?: boolean
  className?: string
  isLoading?: boolean
  filters?: {
    category: string;
    subcategory: string;
    brand: string;
    size: string;
    colour: string;
    condition: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
    onSale: boolean;
  };
  searchQuery?: string;
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
  filters,
  searchQuery
}: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  
  // Filter products based on search and filter criteria
  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filters) {
      if (filters.category && filters.category !== "" && product.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
      
      if (filters.minPrice && parseFloat(filters.minPrice) > product.price) {
        return false;
      }
      
      if (filters.maxPrice && parseFloat(filters.maxPrice) < product.price) {
        return false;
      }
      
      // Add other filter conditions as needed
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
            className="group bg-white p-3 rounded-md border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 relative"
            role="gridcell"
            style={{ contain: 'layout style paint' }}
          >
            <Link 
              href={`/product/${product.id}`}
              className="block focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-md"
            >
              <div 
                className="aspect-[4/5] relative rounded-md overflow-hidden mb-3"
                style={{ willChange: 'transform' }}
              >
                <Image
                  src={product.images[0]?.url || "/placeholder.svg"}
                  alt={product.images[0]?.alt || `Product image of ${product.name}`}
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-110 transition-transform duration-300 will-change-transform"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ 
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }}
                />
              </div>
              <h3 className="font-medium text-base mb-1 line-clamp-2">{product.name}</h3>
              <div className="flex items-center justify-between">
                <p className="text-pink-500 font-semibold" aria-label={`Price: $${product.price.toFixed(2)}`}>
                  ${product.price.toFixed(2)}
                </p>
                <span className="text-sm text-gray-500">{product.category}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <StarRating rating={product.rating} />
                  {product.rating && (
                    <span className="text-sm text-gray-500">{product.rating.toFixed(1)}</span>
                  )}
                </div>
                {product.reviewCount !== undefined && (
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span 
                  className={`text-sm ${
                    product.stockStatus === "In Stock" 
                      ? "text-green-600" 
                      : "text-orange-500"
                  }`}
                  role="status"
                >
                  {product.stockStatus}
                </span>
              </div>
            </Link>
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

function AddToCartButton({ product }: { product: Product }) {
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
      className="absolute bottom-4 right-4 p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
      aria-label={`Add ${product.name} to cart`}
      style={{ willChange: 'transform' }}
    >
      <ShoppingCart className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}
