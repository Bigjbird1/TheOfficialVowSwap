import { Search } from "lucide-react";
import { ServiceCategory } from "../../types/wedding-services";

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  categories: ServiceCategory[];
}

/**
 * SearchAndFilter component provides search and category filtering functionality
 * for wedding services with full keyboard navigation and accessibility support.
 */
export default function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: SearchAndFilterProps) {
  // Handle keyboard navigation for category buttons
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
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <label htmlFor="service-search" className="sr-only">
          Search wedding services
        </label>
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        <input
          id="service-search"
          type="search"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          aria-label="Search wedding services"
        />
      </div>

      {/* Category Filters */}
      <div 
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Filter services by category"
      >
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
