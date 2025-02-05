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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearch.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(debouncedSearch)}`);
        const data = await response.json();
        setSuggestions(data.products.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch]);

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
    <div ref={searchBarRef} className="w-full max-w-4xl mx-auto space-y-4">
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
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 text-white bg-blue-600 rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && (searchTerm.trim() !== '') && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : suggestions.length > 0 ? (
              <ul>
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-sm text-gray-500">${suggestion.price}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
          <select
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
            <label className="block mb-1 text-sm font-medium text-gray-700">Min Price</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="Min"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700">Max Price</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="Max"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex-1 min-w-[200px]">
          <label className="block mb-1 text-sm font-medium text-gray-700">Sort By</label>
          <select
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
