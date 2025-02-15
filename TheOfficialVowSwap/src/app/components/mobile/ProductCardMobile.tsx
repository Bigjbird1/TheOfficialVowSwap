'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBreakpoint } from '@/app/hooks/useBreakpoint';

interface ProductCardMobileProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  sellerName: string;
}

const ProductCardMobile = ({
  id,
  title,
  price,
  imageUrl,
  rating,
  reviewCount,
  sellerName,
}: ProductCardMobileProps) => {
  const { isMobile } = useBreakpoint();

  // Don't render on desktop
  if (!isMobile) return null;

  return (
    <Link href={`/product/${id}`}>
      <div className="flex space-x-4 p-4 bg-white border-b border-gray-200 last:border-b-0">
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 96px, 128px"
            priority
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{sellerName}</p>
          <div className="mt-1 flex items-center">
            <span className="text-lg font-semibold text-gray-900">
              ${price.toFixed(2)}
            </span>
            {rating && (
              <div className="ml-2 flex items-center">
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-sm text-gray-600">
                  {rating.toFixed(1)}
                </span>
                {reviewCount && (
                  <span className="ml-1 text-sm text-gray-500">
                    ({reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default ProductCardMobile;
