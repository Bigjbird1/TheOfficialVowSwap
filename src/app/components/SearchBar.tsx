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
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder="Search for wedding items..."
          className="w-full pl-12 pr-24 py-3 rounded-full border border-gray-200 
                   placeholder-gray-400 focus:outline-none focus:border-rose-400 
                   focus:ring-2 focus:ring-rose-100 transition-all duration-200"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
          aria-describedby={error ? "search-error" : undefined}
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <button
          onClick={handleSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 
                   px-6 py-1.5 bg-rose-500 text-white rounded-full 
                   hover:bg-rose-600 transition-colors duration-200"
          aria-label="Search products"
        >
          Search
        </button>
        {/* Autocomplete Suggestions */}
        {showSuggestions && searchTerm.trim() !== '' && (
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
                <div className="inline-block animate-spin w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full mr-2" />
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

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="category-select"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                     bg-white focus:outline-none focus:border-rose-400 
                     focus:ring-2 focus:ring-rose-100 transition-all duration-200"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price Input */}
        <div className="w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
          <input
            id="min-price"
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="Min"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                     bg-white focus:outline-none focus:border-rose-400 
                     focus:ring-2 focus:ring-rose-100 transition-all duration-200"
            min="0"
          />
        </div>

        {/* Max Price Input */}
        <div className="w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
          <input
            id="max-price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder="Max"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                     bg-white focus:outline-none focus:border-rose-400 
                     focus:ring-2 focus:ring-rose-100 transition-all duration-200"
            min="0"
          />
        </div>

        {/* Sort Options */}
        <div className="w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            id="sort-select"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                     bg-white focus:outline-none focus:border-rose-400 
                     focus:ring-2 focus:ring-rose-100 transition-all duration-200"
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
