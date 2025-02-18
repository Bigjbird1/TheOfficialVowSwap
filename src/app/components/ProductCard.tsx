import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, StarHalf } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import ProductQuickView from './ProductQuickView';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.matchMedia('(min-width: 768px)').matches);
    };
    
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  const handleTap = () => {
    if (!isDesktop) {
      setIsTapped(!isTapped);
    }
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <>
      <motion.div
        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
        onHoverStart={() => isDesktop && setIsHovered(true)}
        onHoverEnd={() => isDesktop && setIsHovered(false)}
        onClick={handleTap}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Product Image */}
        <div className="aspect-square relative rounded-t-2xl overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No Image Available</span>
            </div>
          )}
          
          {/* Quick View Button (Desktop) */}
          {isDesktop && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium transform 
                         hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"
              >
                Quick View
              </motion.button>
            </div>
          )}

          {/* Stock Status Badge */}
          <div className="absolute top-2 right-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium">
            {product.stockStatus}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            {renderRatingStars(product.rating)}
            <span className="text-sm text-gray-600">
              ({product.reviewCount})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-rose-500 font-semibold">
              ${product.price}
            </p>
            <p className="text-sm text-gray-600">
              {product.sellerName}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={product}
        onClose={() => {
          setIsHovered(false);
          setIsTapped(false);
        }}
        isHovered={isHovered}
        isTapped={isTapped}
      />
    </>
  );
};

export default ProductCard;
