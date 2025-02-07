'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  onSearch?: (params: URLSearchParams) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    category: searchParams.get('category') || 'All',
    sort: searchParams.get('sort') || ''
  });
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Categories based on the mock data
  const categories = ['All', 'Lighting', 'Decorations', 'Table Settings'];
  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Best Rating' }
  ];

  // Handle clicks outside the search component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounced search term
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearch.trim()) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(debouncedSearch)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        const data = await response.json();
        setSuggestions(data.products.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError('Unable to load suggestions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch]);

  // Construct search parameters and navigate to results
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (filters.category !== 'All') params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.sort) params.set('sort', filters.sort);

    setShowSuggestions(false);
    onSearch?.(params);
    router.push(`/products?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion: Product) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    handleSearch();
  };

  return (
    <div 
      ref={searchBarRef} 
      className="w-full max-w-4xl mx-auto space-y-4"
      role="search"
      aria-label="Product search"
    >
      {/* Search Input */}
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Search for wedding items..."
            className="w-full px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            aria-expanded={showSuggestions}
            aria-controls="search-suggestions"
            aria-describedby={error ? "search-error" : undefined}
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 text-white bg-blue-600 rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search products"
          >
            Search
          </button>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && (searchTerm.trim() !== '') && (
          <div 
            id="search-suggestions"
            className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
            role="listbox"
          >
            {isLoading ? (
              <div 
                className="p-4 text-center text-gray-500"
                role="status"
                aria-live="polite"
              >
                <div className="inline-block animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                Loading suggestions...
              </div>
            ) : error ? (
              <div 
                id="search-error"
                className="p-4 text-center text-red-500"
                role="alert"
              >
                {error}
              </div>
            ) : suggestions.length > 0 ? (
              <ul>
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    role="option"
                    aria-selected="false"
                  >
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-sm text-gray-500">${suggestion.price}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div 
                className="p-4 text-center text-gray-500"
                role="status"
                aria-live="polite"
              >
                No matching products found. Try adjusting your search terms.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label 
            htmlFor="category-select" 
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category-select"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <div className="flex-1">
            <label 
              htmlFor="min-price" 
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Min Price
            </label>
            <input
              id="min-price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="Min"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label 
              htmlFor="max-price" 
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Max Price
            </label>
            <input
              id="max-price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="Max"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex-1 min-w-[200px]">
          <label 
            htmlFor="sort-select" 
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Sort By
          </label>
          <select
            id="sort-select"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
