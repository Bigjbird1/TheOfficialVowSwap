"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ProductGrid from "../components/ProductGrid";
import { ReadonlyURLSearchParams } from "next/navigation";

interface FilterState {
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
}

interface ProductsClientProps {
  products: any[]; // Using any[] for now, ideally should match the Product interface from ProductGrid
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductsClient({ products, searchParams }: ProductsClientProps) {
  // Helper function to get search param value
  const getSearchParam = (key: string): string => {
    const value = searchParams[key];
    return typeof value === 'string' ? value : Array.isArray(value) ? value[0] : '';
  };

  // Initialize filters from URL search params
  const [filters, setFilters] = useState<FilterState>(() => ({
    category: getSearchParam("category"),
    subcategory: getSearchParam("subcategory"),
    brand: getSearchParam("brand"),
    size: getSearchParam("size"),
    colour: getSearchParam("colour"),
    condition: getSearchParam("condition"),
    minPrice: getSearchParam("minPrice"),
    maxPrice: getSearchParam("maxPrice"),
    sort: getSearchParam("sort") || "newest",
    onSale: getSearchParam("onSale") === "true",
  }));

  const [searchQuery, setSearchQuery] = useState(() => getSearchParam("search"));

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Force a page reload to get fresh data with new filters
    const updatedFilters = { ...filters, [key]: value };
    const queryParams = new URLSearchParams();
    
    // Map filters to API expected format
    if (updatedFilters.category && updatedFilters.category !== "") {
      queryParams.append('categories', updatedFilters.category);
    }
    if (updatedFilters.brand && updatedFilters.brand !== "") {
      queryParams.append('themes', updatedFilters.brand);
    }
    if (updatedFilters.minPrice && updatedFilters.minPrice !== "") {
      queryParams.append('minPrice', updatedFilters.minPrice);
    }
    if (updatedFilters.maxPrice && updatedFilters.maxPrice !== "") {
      queryParams.append('maxPrice', updatedFilters.maxPrice);
    }
    if (updatedFilters.sort && updatedFilters.sort !== "") {
      queryParams.append('sortBy', updatedFilters.sort);
    }
    
    window.location.href = `/products?${queryParams.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* All Items Button */}
      <button
        onClick={() => {
          // Reset all filters and reload page
          window.location.href = '/products';
        }}
        className="w-full mb-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
      >
        Show All Items
      </button>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-24 py-3 border rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button 
            onClick={() => {
              const queryParams = new URLSearchParams();
              
              // Add search query if present
              if (searchQuery) {
                queryParams.append('search', searchQuery);
              }
              
              // Map filters to API expected format
              if (filters.category && filters.category !== "") {
                queryParams.append('categories', filters.category);
              }
              if (filters.brand && filters.brand !== "") {
                queryParams.append('themes', filters.brand);
              }
              if (filters.minPrice && filters.minPrice !== "") {
                queryParams.append('minPrice', filters.minPrice);
              }
              if (filters.maxPrice && filters.maxPrice !== "") {
                queryParams.append('maxPrice', filters.maxPrice);
              }
              if (filters.sort && filters.sort !== "") {
                queryParams.append('sortBy', filters.sort);
              }
              
              window.location.href = `/products?${queryParams.toString()}`;
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All Categories</option>
              <option value="decor">Decor</option>
              <option value="lighting">Lighting</option>
              <option value="furniture">Furniture</option>
              <option value="floral">Floral</option>
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Subcategory</label>
            <select
              value={filters.subcategory}
              onChange={(e) => handleFilterChange("subcategory", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All Subcategories</option>
              {/* Dynamic options based on selected category */}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange("brand", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All Brands</option>
              <option value="luxe">Luxe Weddings</option>
              <option value="rustic">Rustic Charm</option>
              <option value="modern">Modern Romance</option>
            </select>
          </div>

          {/* Size Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Size</label>
            <select
              value={filters.size}
              onChange={(e) => handleFilterChange("size", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All Sizes</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Colour Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Colour</label>
            <select
              value={filters.colour}
              onChange={(e) => handleFilterChange("colour", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All Colours</option>
              <option value="white">White</option>
              <option value="ivory">Ivory</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="rose-gold">Rose Gold</option>
            </select>
          </div>

          {/* Condition Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange("condition", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All Conditions</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* On Sale Toggle */}
        <div className="mt-6">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={(e) => handleFilterChange("onSale", e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            <span className="ms-3 text-sm font-medium text-gray-700">Show only items on sale</span>
          </label>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid 
        products={products} 
        filters={filters} 
        searchQuery={searchQuery} 
      />
    </div>
  );
}
