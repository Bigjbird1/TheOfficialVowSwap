import { Search } from "lucide-react";
import { ServiceCategory } from "../../types/wedding-services";
import { useState } from "react";

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  categories: ServiceCategory[];
}

interface FilterState {
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

export default function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: SearchAndFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    sortBy: 'Default'
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Implement search logic if needed
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    categoryId: string | null
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedCategory(categoryId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6 mb-8">
      {/* Main Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search wedding services..."
          className="w-full pl-12 pr-24 py-3 rounded-full border border-gray-200 
                   placeholder-gray-400 focus:outline-none focus:border-rose-400 
                   focus:ring-2 focus:ring-rose-100 transition-all duration-200"
          aria-label="Search wedding services"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 
                   px-6 py-1.5 bg-rose-500 text-white rounded-full 
                   hover:bg-rose-600 transition-colors duration-200"
        >
          Search
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Category Dropdown */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value === "" ? null : e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                     bg-white focus:outline-none focus:border-rose-400 
                     focus:ring-2 focus:ring-rose-100 transition-all duration-200"
          >
            <option value="">All Services</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price Input */}
        <div className="w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="Min"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                     bg-white focus:outline-none focus:border-rose-400 
                     focus:ring-2 focus:ring-rose-100 transition-all duration-200"
          />
        </div>

        {/* Max Price Input */}
        <div className="w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Max"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                     bg-white focus:outline-none focus:border-rose-400 
                     focus:ring-2 focus:ring-rose-100 transition-all duration-200"
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                     bg-white focus:outline-none focus:border-rose-400 
                     focus:ring-2 focus:ring-rose-100 transition-all duration-200"
          >
            <option value="Default">Default</option>
            <option value="PriceLowToHigh">Price: Low to High</option>
            <option value="PriceHighToLow">Price: High to Low</option>
            <option value="Newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Mobile Category Pills - Show on smaller screens */}
      <div className="md:hidden flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          onKeyDown={(e) => handleKeyDown(e, null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition
            ${
              selectedCategory === null
                ? "bg-rose-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          role="radio"
          aria-checked={selectedCategory === null}
          tabIndex={selectedCategory === null ? 0 : -1}
        >
          All Services
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            onKeyDown={(e) => handleKeyDown(e, category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${
                selectedCategory === category.id
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            role="radio"
            aria-checked={selectedCategory === category.id}
            tabIndex={selectedCategory === category.id ? 0 : -1}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}
