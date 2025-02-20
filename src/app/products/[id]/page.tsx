import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SuspenseBoundary from '@/app/components/SuspenseBoundary';
import ProductQuickView from '@/app/components/ProductQuickView';
import Reviews from '@/app/components/Reviews';
import { prisma } from '@/lib/prisma';
import type { Product, Seller } from '@prisma/client';

// Enable ISR with a revalidation period
export const revalidate = 3600; // Revalidate every hour

type ProductWithSeller = Product & {
  seller: Seller;
};

// Generate static params for popular products
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    orderBy: [
      {
        views: 'desc'
      }
    ],
    take: 100, // Limit to top 100 products
    select: {
      id: true
    }
  });

  return products.map((product) => ({
    id: product.id
  }));
}

async function getProduct(id: string): Promise<ProductWithSeller | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: true
    }
  });

  if (!product) {
    notFound();
  }

  // Increment view count in the background
  prisma.product.update({
    where: { id },
    data: {
      views: {
        increment: 1
      }
    }
  }).catch(console.error);

  return product;
}

interface ProductDetailsProps {
  id: string;
}

async function ProductDetails({ id }: ProductDetailsProps) {
  const product = await getProduct(id);
  
  if (!product) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductQuickView product={product} detailed />
      <div className="mt-16">
        <SuspenseBoundary>
          <Reviews product={product} />
        </SuspenseBoundary>
      </div>
    </div>
  );
}

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <SuspenseBoundary>
      <Suspense fallback={<div>Loading product...</div>}>
        <ProductDetails id={params.id} />
      </Suspense>
    </SuspenseBoundary>
  );
}
