import React from 'react';
import { Product } from '../types';

interface SimilarProductsProps {
  currentProduct: Product;
  similarProducts?: Product[];
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ currentProduct, similarProducts = [] }) => {
  // In a real app, this would be filtered products from the same category
  const mockSimilarProducts: Product[] = [
    {
      id: '2',
      name: 'Similar Product 1',
      price: currentProduct.price * 0.9,
      description: 'A similar product with slightly different specifications',
      category: currentProduct.category,
      rating: 4.5,
      reviewCount: 28,
      stockStatus: 'In Stock',
      images: [{ id: '1', url: '/product1.jpg', alt: 'Similar Product 1' }],
      specifications: {
        ...currentProduct.specifications,
        size: 'Medium',
      },
      shippingInfo: 'Free shipping',
      sellerName: 'Another Seller',
      sellerRating: 4.2
    },
    {
      id: '3',
      name: 'Similar Product 2',
      price: currentProduct.price * 1.1,
      description: 'A premium alternative with enhanced features',
      category: currentProduct.category,
      rating: 4.8,
      reviewCount: 42,
      stockStatus: 'In Stock',
      images: [{ id: '1', url: '/product2.jpg', alt: 'Similar Product 2' }],
      specifications: {
        ...currentProduct.specifications,
        size: 'Large',
      },
      shippingInfo: 'Free shipping',
      sellerName: 'Premium Seller',
      sellerRating: 4.7
    }
  ];

  const products = similarProducts.length > 0 ? similarProducts : mockSimilarProducts;

  const renderPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderComparisonHighlight = (product: Product) => {
    if (product.price < currentProduct.price) {
      return 'More Affordable Option';
    } else if (product.rating > currentProduct.rating) {
      return 'Higher Rated';
    } else if (product.reviewCount > currentProduct.reviewCount) {
      return 'More Reviews';
    }
    return 'Alternative Option';
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Similar Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                {/* This would be an actual image in production */}
                <span className="text-gray-400">Image</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{product.name}</h3>
                    <p className="text-blue-600 font-medium">{renderPrice(product.price)}</p>
                  </div>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {renderComparisonHighlight(product)}
                  </span>
                </div>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">{product.rating.toFixed(1)}</span>
                    <span className="mx-1">·</span>
                    <span className="text-gray-600">{product.reviewCount} reviews</span>
                  </div>
                  
                  {/* Key Differences */}
                  <div className="text-sm text-gray-600">
                    {Object.entries(product.specifications).map(([key, value], index) => {
                      const currentValue = currentProduct.specifications[key];
                      if (value !== currentValue) {
                        return (
                          <div key={key} className="flex items-center">
                            <span className="w-20 text-gray-500">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                <button className="mt-3 w-full bg-white border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition-colors text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
