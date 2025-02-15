import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent scrolling on the body when the modal is open
    document.body.classList.add('overflow-hidden');

    // Cleanup function to re-enable scrolling when the modal is closed
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

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
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative mx-4"
        >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div className="aspect-square relative rounded-xl overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
            <p className="text-rose-500 text-xl font-semibold mb-4">
              ${product.price}
            </p>
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
