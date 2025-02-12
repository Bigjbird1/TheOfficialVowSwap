'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '../hooks/useDebounce';
import { FilterOption, PriceRange, ProductFilters, SORT_OPTIONS, DEFAULT_PRICE_RANGE } from '../types/filters';
import { Product } from '../types';

interface FilterBarProps {
  onFilterChange: (filters: ProductFilters) => void;
  onSortChange: (sortOption: string) => void;
  onSearch?: (params: URLSearchParams) => void;
}

export default function FilterBar({ onFilterChange, onSortChange, onSearch }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [filters, setFilters] = useState<ProductFilters>({
    priceRange: DEFAULT_PRICE_RANGE,
    categories: [],
  });

  // Filter options
  const categories = [
    { label: 'Dresses', value: 'dresses' },
    { label: 'Suits', value: 'suits' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Decorations', value: 'decorations' },
  ];

  const subcategories = {
    dresses: [
      { label: 'Wedding Dresses', value: 'wedding-dresses' },
      { label: 'Bridesmaid Dresses', value: 'bridesmaid-dresses' },
      { label: 'Flower Girl Dresses', value: 'flower-girl-dresses' },
    ],
    suits: [
      { label: 'Tuxedos', value: 'tuxedos' },
      { label: 'Dress Suits', value: 'dress-suits' },
      { label: 'Ring Bearer Suits', value: 'ring-bearer-suits' },
    ],
  };

  const brands = [
    { label: 'Vera Wang', value: 'vera-wang' },
    { label: 'David\'s Bridal', value: 'davids-bridal' },
    { label: 'BHLDN', value: 'bhldn' },
  ];

  const sizes = [
    { label: 'XS', value: 'xs' },
    { label: 'S', value: 's' },
    { label: 'M', value: 'm' },
    { label: 'L', value: 'l' },
    { label: 'XL', value: 'xl' },
  ];

  const colors = [
    { label: 'White', value: 'white' },
    { label: 'Ivory', value: 'ivory' },
    { label: 'Champagne', value: 'champagne' },
    { label: 'Blush', value: 'blush' },
  ];

  const conditions = [
    { label: 'New with tags', value: 'new-with-tags' },
    { label: 'New without tags', value: 'new-without-tags' },
    { label: 'Like new', value: 'like-new' },
    { label: 'Good', value: 'good' },
  ];

  // Handle search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearch.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(debouncedSearch)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
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

  // Handle clicks outside search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (filters.categories?.length) params.set('category', filters.categories[0]);
    if (filters.priceRange?.min) params.set('minPrice', filters.priceRange.min.toString());
    if (filters.priceRange?.max) params.set('maxPrice', filters.priceRange.max.toString());

    setShowSuggestions(false);
    onSearch?.(params);
    router.push(`/products?${params.toString()}`);
  };

  const renderDropdown = (label: string, options: FilterOption[], onChange: (value: string) => void) => (
    <div className="relative flex-1 min-w-[150px]">
      <select
        className="w-full appearance-none bg-white border border-gray-200 rounded-lg h-10 px-4 text-sm
                   hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300 
                   transition-all duration-200"
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md">
      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div ref={searchBarRef} className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Search for wedding items..."
                className="w-full pl-10 pr-4 py-2 h-10 rounded-lg border border-gray-200 
                         placeholder-gray-400 focus:outline-none focus:border-pink-300 
                         focus:ring-2 focus:ring-pink-100 transition-all duration-200"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="h-4 w-4 text-gray-400"
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
            </div>
            <button
              onClick={handleSearch}
              className="px-6 h-10 bg-pink-500 text-white rounded-lg hover:bg-pink-600 
                       transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Search
            </button>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && searchTerm.trim() !== '' && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="inline-block animate-spin w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full mr-2" />
                  Loading suggestions...
                </div>
              ) : suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      onClick={() => {
                        setSearchTerm(suggestion.name);
                        setShowSuggestions(false);
                        handleSearch();
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-sm text-gray-500">${suggestion.price}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No matching products found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary Filters */}
      <div className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-4">
            {renderDropdown('Category', categories, (value) => handleFilterChange('categories', [value]))}
            
            {/* Price Range */}
            <div className="flex gap-2 flex-1 min-w-[300px]">
              <input
                type="number"
                placeholder="Min Price"
                className="w-1/2 px-4 h-10 rounded-lg border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300
                         transition-all duration-200"
                onChange={(e) => handleFilterChange('priceRange', {
                  ...filters.priceRange,
                  min: Number(e.target.value)
                })}
              />
              <input
                type="number"
                placeholder="Max Price"
                className="w-1/2 px-4 h-10 rounded-lg border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300
                         transition-all duration-200"
                onChange={(e) => handleFilterChange('priceRange', {
                  ...filters.priceRange,
                  max: Number(e.target.value)
                })}
              />
            </div>

            {renderDropdown('Sort By', SORT_OPTIONS, onSortChange)}
          </div>
        </div>
      </div>

      {/* Secondary Filters */}
      <div className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-4">
            {filters.categories?.[0] && renderDropdown(
              'Subcategory',
              subcategories[filters.categories[0] as keyof typeof subcategories] || [],
              (value) => handleFilterChange('subcategory', value)
            )}
            {renderDropdown('Brand', brands, (value) => handleFilterChange('brand', value))}
            {renderDropdown('Size', sizes, (value) => handleFilterChange('size', value))}
            {renderDropdown('Colour', colors, (value) => handleFilterChange('color', value))}
            {renderDropdown('Condition', conditions, (value) => handleFilterChange('condition', value))}
            
            {/* On Sale Toggle */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 
                            peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full 
                            peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[2px] 
                            after:left-[2px] after:bg-white after:border-gray-300 after:border 
                            after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                <span className="ml-2 text-sm text-gray-600">On Sale</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
