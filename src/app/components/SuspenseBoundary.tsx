import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="p-4 rounded-lg bg-red-50 text-red-700">
    <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
    <p className="mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Try again
    </button>
  </div>
);

const LoadingFallback = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

export const SuspenseBoundary = ({
  children,
  fallback = <LoadingFallback />,
  onReset,
}: SuspenseBoundaryProps) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={onReset}
    onError={(error) => {
      // Log error to your error tracking service
      console.error('Error caught by boundary:', error);
    }}
  >
    <Suspense fallback={fallback}>{children}</Suspense>
  </ErrorBoundary>
);

export default SuspenseBoundary;
