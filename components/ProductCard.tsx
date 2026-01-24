'use client';

import Image from 'next/image';
import { formatPrice } from '@/lib/api';
import { cn, getImageURL, MenuProduct } from '~/lib/utils';
import FavoriteButton from './FavoriteButton';
import { useStore } from '~/contexts/store-context';

interface ProductCardProps {
  product: MenuProduct;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const isAvailable = true;
  const storeInfo = useStore();
  const storeKey = storeInfo?.slug || 'default';
  const logo = storeInfo?.logo || '';
  const logoURL = logo;
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
      <div className='absolute top-2 right-2 z-10'>
        <FavoriteButton storeKey={storeKey} productId={product._id} name={product.name} image={product.images?.[0]} price={product.currentPrice} />
      </div>

      {/* Image container with fixed height */}
      <div className={cn('relative w-full h-56 overflow-hidden', !product.images?.length && 'flex items-center justify-center bg-gray-50 rounded-sm')}>
        {product.images?.length ? (
          <Image
            src={getImageURL(product.images[0])}
            alt={product.name}
            fill
            className='object-contain'
            sizes='(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw'
          />
        ) : logoURL ? (
          <div className='relative w-24 h-24 opacity-40 grayscale'> 
            <Image src={logoURL} alt='Restaurant logo' fill className='object-contain' sizes='96px' />
          </div>
        ) : (
          <div className='text-xs text-gray-400'>No image</div>
        )}
      </div>

      {/* Product info */}
      <div className='p-3 flex flex-col items-center text-center'>
        <h3 className='line-clamp-2 text-sm md:text-base'>{product.name}</h3>
        <p className='text-base  text-gray-500'>{formatPrice(product.currentPrice)}</p>
      </div>
    </button>
  );
}
