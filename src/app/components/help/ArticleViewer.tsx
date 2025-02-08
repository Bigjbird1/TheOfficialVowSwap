import { useState } from 'react';
import { HelpArticle } from '@/app/types/help-center';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ArticleViewerProps {
  article: HelpArticle;
}

export default function ArticleViewer({ article }: ArticleViewerProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedback = async (isHelpful: boolean) => {
    if (feedbackSubmitted) return;

    try {
      await fetch(`/api/help/articles/${article.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful: isHelpful }),
      });

      setFeedback(isHelpful ? 'helpful' : 'not-helpful');
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <article className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
      <div className="mb-6">
        <Link
          href="/help"
          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          ← Back to Help Center
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{article.category?.name}</span>
          <span>•</span>
          <span>{article.views} views</span>
          <span>•</span>
          <span>Last updated {new Date(article.updatedAt).toLocaleDateString()}</span>
        </div>
      </header>

      <div className="prose prose-indigo max-w-none mb-12">
        {article.content}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Was this article helpful?</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleFeedback(true)}
            disabled={feedbackSubmitted}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
              feedback === 'helpful'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${feedbackSubmitted && feedback !== 'helpful' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HandThumbUpIcon className="h-5 w-5 mr-2" />
            Yes
          </button>
          <button
            onClick={() => handleFeedback(false)}
            disabled={feedbackSubmitted}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
              feedback === 'not-helpful'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${feedbackSubmitted && feedback !== 'not-helpful' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HandThumbDownIcon className="h-5 w-5 mr-2" />
            No
          </button>
        </div>
        {feedbackSubmitted && (
          <p className="mt-4 text-sm text-gray-600">
            Thank you for your feedback! This helps us improve our help center.
          </p>
        )}
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Tags:</span>
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
