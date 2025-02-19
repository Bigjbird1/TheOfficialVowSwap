import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, X, SlidersHorizontal, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { Range } from 'react-range';

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterCategory {
  name: string;
  options: FilterOption[];
}

export interface FilterBarFilters {
  categories?: string[];
  price?: [number, number];
  sizes?: string[];
  colors?: string[];
  conditions?: string[];
  themes?: string[];
  sellerTypes?: string[];
  ratings?: string[];
  sortBy?: string;
}

const FILTER_CATEGORIES: FilterCategory[] = [
  {
    name: 'Category',
    options: [
      { id: 'decor', label: 'Decor' },
      { id: 'lighting', label: 'Lighting' },
      { id: 'furniture', label: 'Furniture' },
      { id: 'tableware', label: 'Tableware' },
      { id: 'apparel', label: 'Apparel' },
      { id: 'jewelry', label: 'Jewelry' },
      { id: 'accessories', label: 'Accessories' },
      { id: 'stationery', label: 'Stationery' },
    ],
  },
  {
    name: 'Theme',
    options: [
      { id: 'classic', label: 'Classic' },
      { id: 'rustic', label: 'Rustic' },
      { id: 'modern', label: 'Modern' },
      { id: 'bohemian', label: 'Bohemian' },
      { id: 'beach', label: 'Beach' },
      { id: 'vintage', label: 'Vintage' },
      { id: 'garden', label: 'Garden' },
      { id: 'minimalist', label: 'Minimalist' },
    ],
  },
  {
    name: 'Size',
    options: [
      { id: 'small', label: 'Small' },
      { id: 'medium', label: 'Medium' },
      { id: 'large', label: 'Large' },
      { id: 'xlarge', label: 'Extra Large' },
    ],
  },
  {
    name: 'Color',
    options: [
      { id: 'white', label: 'White' },
      { id: 'ivory', label: 'Ivory' },
      { id: 'gold', label: 'Gold' },
      { id: 'silver', label: 'Silver' },
      { id: 'rose-gold', label: 'Rose Gold' },
      { id: 'black', label: 'Black' },
      { id: 'blush', label: 'Blush' },
      { id: 'burgundy', label: 'Burgundy' },
      { id: 'sage', label: 'Sage' },
      { id: 'navy', label: 'Navy' },
    ],
  },
  {
    name: 'Condition',
    options: [
      { id: 'new', label: 'New' },
      { id: 'like-new', label: 'Like New' },
      { id: 'good', label: 'Good' },
      { id: 'fair', label: 'Fair' },
    ],
  },
  {
    name: 'Seller Type',
    options: [
      { id: 'verified', label: 'Verified Seller' },
      { id: 'top-rated', label: 'Top Rated' },
      { id: 'professional', label: 'Professional' },
      { id: 'individual', label: 'Individual' },
    ],
  },
  {
    name: 'Rating',
    options: [
      { id: '4-up', label: '4★ & Up' },
      { id: '3-up', label: '3★ & Up' },
      { id: '2-up', label: '2★ & Up' },
    ],
  },
];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating-desc', label: 'Highest Rated' },
];

interface FilterBarProps {
  onFilterChange?: (filters: FilterBarFilters) => void;
  onSortChange?: (sortOption: string) => void;
  isLoading?: boolean;
}

export default function FilterBar({ onFilterChange, onSortChange, isLoading = false }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [activeSort, setActiveSort] = useState<string>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Handle scroll for blur effect
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterClick = (categoryName: string, optionId: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (!newFilters[categoryName]) {
        newFilters[categoryName] = [optionId];
      } else if (newFilters[categoryName].includes(optionId)) {
        newFilters[categoryName] = newFilters[categoryName].filter(id => id !== optionId);
        if (newFilters[categoryName].length === 0) {
          delete newFilters[categoryName];
        }
      } else {
        newFilters[categoryName] = [...newFilters[categoryName], optionId];
      }
      return newFilters;
    });

    // Notify parent of filter changes
    onFilterChange?.({
      ...activeFilters,
      price: priceRange,
      sortBy: activeSort
    });
  };

  const handleSortChange = (sortOption: string) => {
    setActiveSort(sortOption);
    onSortChange?.(sortOption);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    onFilterChange?.({
      ...activeFilters,
      price: [values[0], values[1]],
      sortBy: activeSort
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilterChange?.({});
  };
  
  return (
    <>
      <div className={`sticky top-0 z-40 transition-all duration-300 ${
        hasScrolled ? 'bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/50' : 'bg-white'
      } border-b border-gray-200/80 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 border-0 
                         focus:ring-2 focus:ring-rose-500 focus:bg-white shadow-sm hover:shadow-md 
                         transition-all duration-200 placeholder:text-rose-400/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400/70" />
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-1 px-4 py-2 text-sm font-medium text-white 
                       bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 
                       rounded-full shadow-sm hover:shadow-md transition-all duration-200"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Filter Dropdowns */}
          <div className="hidden md:flex items-center gap-4 pb-4">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="min-w-[160px] px-4 py-2.5 bg-white border border-rose-100 rounded-full text-sm font-medium text-rose-900 hover:bg-rose-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all duration-200">
                <div className="flex items-center justify-between gap-2">
                  <span>{SORT_OPTIONS.find(opt => opt.id === activeSort)?.label || 'Sort By'}</span>
                  <ChevronDown className="w-4 h-4 text-rose-500/80" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                {SORT_OPTIONS.map(option => (
                  <DropdownMenuItem
                    key={option.id}
                    selected={activeSort === option.id}
                    onClick={() => handleSortChange(option.id)}
                    className="data-[selected]:bg-rose-50 data-[selected]:text-rose-900 hover:bg-rose-50/50 transition-colors duration-200"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {FILTER_CATEGORIES.map(category => (
              <DropdownMenu key={category.name}>
                <DropdownMenuTrigger className={`min-w-[140px] px-4 py-2.5 bg-white border border-rose-100 rounded-full text-sm font-medium text-rose-900 hover:bg-rose-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all duration-200 ${
                  activeFilters[category.name]?.length ? 'bg-rose-100' : ''
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      {activeFilters[category.name]?.length
                        ? `${category.name} (${activeFilters[category.name].length})`
                        : category.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-rose-500/80" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                  {category.options.map(option => (
                    <DropdownMenuItem
                      key={option.id}
                      selected={activeFilters[category.name]?.includes(option.id)}
                      onClick={() => handleFilterClick(category.name, option.id)}
                      className="data-[selected]:bg-rose-50 data-[selected]:text-rose-900 hover:bg-rose-50/50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 border rounded ${
                          activeFilters[category.name]?.includes(option.id)
                            ? 'bg-rose-500 border-rose-500'
                            : 'border-gray-300'
                        }`}>
                          {activeFilters[category.name]?.includes(option.id) && (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          )}
                        </div>
                        {option.label}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            
            {Object.keys(activeFilters).length > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 rounded-full transition-colors duration-200 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="md:hidden fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-lg z-50 p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                {FILTER_CATEGORIES.map(category => (
                  <div key={category.name}>
                    <h4 className="text-sm font-medium text-rose-900 mb-3">{category.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.options.map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleFilterClick(category.name, option.id)}
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                                    transition-all duration-200 ${
                            activeFilters[category.name]?.includes(option.id)
                              ? 'bg-rose-100 text-rose-900 shadow-sm'
                              : 'bg-white border border-rose-100 text-rose-900 hover:bg-rose-50/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Price Range Slider */}
                <div>
                  <h4 className="text-sm font-medium text-rose-900 mb-3">
                    Price Range (${priceRange[0]} - ${priceRange[1]})
                  </h4>
                  <div className="px-4">
                    <Range
                      step={10}
                      min={0}
                      max={1000}
                      values={priceRange}
                      onChange={handlePriceRangeChange}
                      renderTrack={({ props, children }) => (
                        <div
                          {...props}
                          className="h-1.5 w-full bg-rose-100 rounded-full transition-all duration-200"
                        >
                          {children}
                        </div>
                      )}
                      renderThumb={({ props }) => (
                        <div
                          {...props}
                          className="h-5 w-5 bg-white rounded-full shadow-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-transform duration-200 hover:scale-105"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters Bar */}
      <AnimatePresence>
        {Object.keys(activeFilters).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-16 z-30 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border-b border-gray-200/80"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeFilters).flatMap(([category, optionIds]) => {
                  const categoryData = FILTER_CATEGORIES.find(c => c.name === category);
                  if (!categoryData) return [];
                  
                  return optionIds.map(optionId => {
                    const option = categoryData.options.find(o => o.id === optionId);
                    if (!option) return null;
                    
                    return (
                      <motion.button
                        key={`${category}-${optionId}`}
                        onClick={() => handleFilterClick(category, optionId)}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {`${categoryData.name}: ${option.label}`}
                        <X className="w-4 h-4 ml-1" />
                      </motion.button>
                    );
                  }).filter(Boolean);
                })}
                <motion.button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear all
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/60 backdrop-blur-sm supports-[backdrop-filter]:bg-white/30 flex items-center justify-center z-50"
          >
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
