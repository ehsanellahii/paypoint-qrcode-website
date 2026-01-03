'use client';

import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice, isProductAvailable } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const isAvailable = isProductAvailable(product);

  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={`
        relative flex flex-col bg-white overflow-hidden
        ${isAvailable 
          ? 'cursor-pointer' 
          : 'cursor-not-allowed opacity-30'
        }
      `}
      aria-label={`${product.name}, ${formatPrice(product.price)}${!isAvailable ? ', not available' : ''}`}
      aria-disabled={!isAvailable}
    >
      {/* Image container with fixed height */}
      <div className="relative w-full h-56 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
        />
      </div>

      {/* Product info */}
      <div className="p-3 flex flex-col items-center text-center">
        <h3 className="line-clamp-2 text-sm md:text-base">
          {product.name}
        </h3>
        <p className="text-base md:text-lg text-gray-500">
          {formatPrice(product.price)}
        </p>
      </div>
    </button>
  );
}
