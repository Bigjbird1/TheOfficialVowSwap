import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Star, StarHalf, Store, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
  isHovered?: boolean; // For desktop hover trigger
  isTapped?: boolean;  // For mobile tap trigger
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ 
  product, 
  onClose, 
  isHovered = false,
  isTapped = false 
}) => {
  const { addItem } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const isVisible = isHovered || isTapped;

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('overflow-hidden');
      return () => document.body.classList.remove('overflow-hidden');
    }
  }, [isVisible]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setError(null);

    const result = await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/placeholder.svg',
    });

    setAddingToCart(false);

    if (result.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      setError(result.message || 'Failed to add item to cart.');
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

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square relative rounded-xl overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt || product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No Image Available</span>
                  </div>
                )}
              </div>
              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition
                                ${selectedImage === index ? 'border-rose-500' : 'border-transparent'}`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || `${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
                <div className="flex items-center gap-2 mb-2">
                  {renderRatingStars(product.rating)}
                  <span className="text-sm text-gray-600">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                <p className="text-rose-500 text-xl font-semibold">
                  ${product.price}
                </p>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                <Store className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">{product.sellerName}</p>
                  <div className="flex items-center gap-1">
                    {renderRatingStars(product.sellerRating)}
                    <span className="text-sm text-gray-600">Seller Rating</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                <span>{product.shippingInfo}</span>
              </div>

              {/* Specifications */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              <div className="space-y-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 
                           disabled:bg-rose-300 transform hover:scale-105 transition duration-300 
                           flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                <Link
                  href={`/product/${product.id}`}
                  className="block w-full px-6 py-3 text-center border border-gray-300 rounded-full 
                           text-gray-700 hover:bg-gray-50 transform hover:scale-105 transition duration-300"
                >
                  View Full Details
                </Link>
              </div>

              {/* Feedback Messages */}
              {addedToCart && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-center">
                  Item added to cart successfully!
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductQuickView;
