import { HelpArticle } from '@/app/types/help-center';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface ArticleListProps {
  articles: HelpArticle[];
  isLoading: boolean;
}

export default function ArticleList({ articles, isLoading }: ArticleListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-lg shadow p-6"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No articles found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/help/articles/${article.slug}`}
          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm">{article.excerpt}</p>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <span className="text-indigo-600 font-medium">
                {article.category?.name}
              </span>
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center space-x-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <span>{article.views} views</span>
              <span>•</span>
              <span>{article.helpful} found this helpful</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
