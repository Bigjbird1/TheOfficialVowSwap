"use client";

import { useState, useEffect } from "react";
import ProductGrid from "../components/ProductGrid";
import FilterBar, { FilterBarFilters } from "../components/FilterBar";
import RecommendedProducts from "../components/RecommendedProducts";
import { ReadonlyURLSearchParams } from "next/navigation";
import { Product } from "../types";

interface FilterState {
  category: string;
  subcategory: string;
  size: string;
  color: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  onSale: boolean;
  view: string;
}

interface ProductsClientProps {
  products: Product[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductsClient({ products, searchParams }: ProductsClientProps) {
  // Helper function to get search param value
  const getSearchParam = (key: string): string => {
    const value = searchParams[key];
    return typeof value === 'string' ? value : Array.isArray(value) ? value[0] : '';
  };

  // Initialize filters from URL search params
  const [filters, setFilters] = useState<FilterState>(() => {
    const view = getSearchParam("view");
    let initialFilters: FilterState = {
      category: getSearchParam("category"),
      subcategory: getSearchParam("subcategory"),
      size: getSearchParam("size"),
      color: getSearchParam("color"),
      condition: getSearchParam("condition"),
      minPrice: getSearchParam("minPrice"),
      maxPrice: getSearchParam("maxPrice"),
      sort: getSearchParam("sort") || "newest",
      onSale: getSearchParam("onSale") === "true",
      view
    };

    // Apply preset filters based on view
    switch (view) {
      case "deals":
        initialFilters.onSale = true;
        initialFilters.sort = "discount";
        break;
      case "trending":
        initialFilters.sort = "trending";
        break;
      case "discover":
        initialFilters.sort = "recommended";
        break;
    }

    return initialFilters;
  });

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Force a page reload to get fresh data with new filters
    const updatedFilters = { ...filters, [key]: value };
    const queryParams = new URLSearchParams();
    
    // Map filters to API expected format
    if (updatedFilters.category && updatedFilters.category !== "") {
      queryParams.append('categories', updatedFilters.category);
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
    if (updatedFilters.view && updatedFilters.view !== "") {
      queryParams.append('view', updatedFilters.view);
    }
    
    window.location.href = `/products?${queryParams.toString()}`;
  };

  const [isLoading, setIsLoading] = useState(false);

  // Handle filter changes with loading state
  const handleFilterUpdate = async (newFilters: FilterBarFilters) => {
    setIsLoading(true);
    const queryParams = new URLSearchParams();
    
    if (newFilters.category) queryParams.append('categories', newFilters.category);
    if (newFilters.price) {
      const [min, max] = newFilters.price.split('-');
      if (min) queryParams.append('minPrice', min);
      if (max) queryParams.append('maxPrice', max);
    }
    if (newFilters.color) queryParams.append('color', newFilters.color);
    if (newFilters.condition) queryParams.append('condition', newFilters.condition);
    if (newFilters.size) queryParams.append('size', newFilters.size);
    
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    window.location.href = `/products?${queryParams.toString()}`;
  };

  // Handle sort changes with loading state
  const handleSortUpdate = async (sortOption: string) => {
    setIsLoading(true);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('sortBy', sortOption);
    
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    window.location.href = `/products?${queryParams.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative">
      <FilterBar
        onFilterChange={handleFilterUpdate}
        onSortChange={handleSortUpdate}
        isLoading={isLoading}
      />

      {/* Recommended Products */}
      <RecommendedProducts maxItems={8} title="Popular Wedding Items" />

      {/* Product Grid */}
      <div className="mt-6">
        <ProductGrid 
          products={products} 
          filters={filters}
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
}
