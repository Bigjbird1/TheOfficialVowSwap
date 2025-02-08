import { HelpCategory } from '@/app/types/help-center';

interface CategoryFilterProps {
  categories: HelpCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Categories</h2>
      <div className="space-y-2">
        <button
          className={`w-full text-left px-3 py-2 rounded-md ${
            selectedCategory === ''
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => onSelectCategory('')}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`w-full text-left px-3 py-2 rounded-md ${
              selectedCategory === category.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
