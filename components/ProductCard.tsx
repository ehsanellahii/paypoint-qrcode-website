'use client';

import Image from 'next/image';
import { formatPrice } from '@/lib/api';
import { getImageURL, MenuProduct } from '~/lib/utils';

interface ProductCardProps {
  product: MenuProduct;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const isAvailable = true;

  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={`
        relative flex flex-col bg-white overflow-hidden
        ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
      `}
      aria-label={`${product.name}, ${formatPrice(product.currentPrice)}${!isAvailable ? ', not available' : ''}`}
      aria-disabled={!isAvailable}>
      {/* Image container with fixed height */}
      <div className='relative w-full h-56 overflow-hidden'>
        <Image
          src={product.images?.length ? getImageURL(product.images[0]) : '/'}
          alt={product.name}
          fill
          className='object-contain'
          sizes='(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw'
        />
      </div>

      {/* Product info */}
      <div className='p-3 flex flex-col items-center text-center'>
        <h3 className='line-clamp-2 text-sm md:text-base'>{product.name}</h3>
        <p className='text-base  text-gray-500'>{formatPrice(product.currentPrice)}</p>
      </div>
    </button>
  );
}
