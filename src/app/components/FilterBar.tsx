import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterCategory {
  name: string;
  options: FilterOption[];
}

export interface FilterBarFilters {
  category?: string;
  price?: string;
  size?: string;
  color?: string;
  condition?: string;
}

const FILTER_CATEGORIES: FilterCategory[] = [
  {
    name: 'Category',
    options: [
      { id: 'decor', label: 'Decor' },
      { id: 'lighting', label: 'Lighting' },
      { id: 'furniture', label: 'Furniture' },
      { id: 'tableware', label: 'Tableware' },
    ],
  },
  {
    name: 'Price',
    options: [
      { id: 'under-50', label: 'Under $50' },
      { id: '50-100', label: '$50 - $100' },
      { id: '100-200', label: '$100 - $200' },
      { id: 'over-200', label: '$200+' },
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
];

interface FilterBarProps {
  onFilterChange?: (filters: FilterBarFilters) => void;
  onSortChange?: (sortOption: string) => void;
  isLoading?: boolean;
}

export default function FilterBar({ onFilterChange, onSortChange, isLoading = false }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
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
      if (newFilters[categoryName] === optionId) {
        delete newFilters[categoryName];
      } else {
        newFilters[categoryName] = optionId;
      }
      return newFilters;
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
                className="w-full h-10 pl-10 pr-4 rounded-full bg-gradient-to-r from-violet-50 to-fuchsia-50 border-0 
                         focus:ring-2 focus:ring-violet-500 focus:bg-white shadow-sm hover:shadow-md 
                         transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
            {FILTER_CATEGORIES.map(category => (
              <DropdownMenu key={category.name}>
                <DropdownMenuTrigger className="min-w-[140px] px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-rose-200 hover:bg-rose-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <span>{activeFilters[category.name] 
                      ? FILTER_CATEGORIES.find(c => c.name === category.name)?.options.find(o => o.id === activeFilters[category.name])?.label 
                      : category.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {category.options.map(option => (
                    <DropdownMenuItem
                      key={option.id}
                      selected={activeFilters[category.name] === option.id}
                      onClick={() => handleFilterClick(category.name, option.id)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            
            {Object.keys(activeFilters).length > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 rounded-lg transition-colors duration-200"
              >
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
              <div className="space-y-4">
                {FILTER_CATEGORIES.map(category => (
                  <div key={category.name}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{category.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.options.map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleFilterClick(category.name, option.id)}
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm
                                    transition-all duration-200 ${
                            activeFilters[category.name] === option.id
                              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
                              : 'bg-gradient-to-r from-violet-50 to-fuchsia-50 text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
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
                {Object.entries(activeFilters).map(([category, optionId]) => {
                  const categoryData = FILTER_CATEGORIES.find(c => c.name === category);
                  const option = categoryData?.options.find(o => o.id === optionId);
                  if (!option) return null;
                  
                  return (
                    <motion.button
                      key={`${category}-${optionId}`}
                      onClick={() => handleFilterClick(category, optionId)}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option.label}
                      <X className="w-4 h-4 ml-1" />
                    </motion.button>
                  );
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
