import { useState, useEffect } from 'react';
import { HelpArticle, HelpCategory } from '@/app/types/help-center';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import ArticleList from './ArticleList';
import CategoryFilter from './CategoryFilter';
import { useDebounce } from '@/app/hooks/useDebounce';

export default function HelpCenter() {
  const router = useRouter();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/help/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('query', debouncedSearch);
        if (selectedCategory) params.append('category', selectedCategory);

        const response = await fetch(`/api/help?${params.toString()}`);
        const data = await response.json();
        setArticles(data.articles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [debouncedSearch, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          How can we help you?
        </h1>
        <p className="text-lg text-gray-600">
          Search our help center for answers to common questions
        </p>
      </div>

      <div className="mb-8">
        <SearchBar
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search for help articles..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="lg:col-span-3">
          <ArticleList articles={articles} isLoading={isLoading} />
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Can't find what you're looking for?
        </h2>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => router.push('/contact')}
        >
          Contact Support
        </button>
      </div>
    </div>
  );
}
