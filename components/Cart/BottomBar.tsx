/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '~/contexts/cart-context';
import { useLanguage } from '@/contexts/language-context';
import { formatPrice } from '@/lib/api';
import Cart from './Cart';
import { IStoreInfo } from '~/lib/types';
import { isRestaurantOpen } from '~/lib/restaurantTimings';
import { getImageURL } from '~/lib/utils';

export default function BottomBar({ storeInfo }: { storeInfo?: IStoreInfo }) {
  const { cart, totalItems, totalPrice } = useCart();
  const { t } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  // const isClosed = isRestaurantClosed();
  const isOpen = isRestaurantOpen(storeInfo?.timings || {});
  const isClosed = !isOpen;
  // if (totalItems === 0) return null;
  useEffect(() => {
    if (totalItems === 0) setIsCartOpen(false);
  }, [totalItems]);

  return (
    <>
      {totalItems !== 0 && (
        <button
          onClick={() => !isClosed && setIsCartOpen(true)}
          className='fixed bottom-4 left-4 right-4 bg-white rounded-lg p-4 border border-gray-100 shadow-md flex items-stretch cursor-pointer z-40'
          aria-label={`Open cart with ${totalItems} item${totalItems !== 1 ? 's' : ''}, total ${formatPrice(totalPrice)}`}
          disabled={isClosed}>
          <div className='grow flex items-center overflow-x-scroll scrollbar-hide'>
            {cart.map((item) => (
              <div key={item.id} className='inline-flex h-full items-center bg-gray-100 rounded pl-3 pr-5 mr-3'>
                <div className='relative w-14 aspect-square mr-2'>
                  <Image
                    src={item.product.images?.length ? getImageURL(item.product.images[0]) : ''}
                    alt={`${item.product.name} image`}
                    fill
                    className='object-cover'
                    sizes='56px'
                  />
                  {item.quantity > 1 && (
                    <div className='absolute bottom-0 right-0 bg-primary text-(--selected-text) text-xs font-bold rounded-tl px-1'>{item.quantity}</div>
                  )}
                </div>
                <h3 className='font-medium'>{item.product.name}</h3>
              </div>
            ))}
          </div>

          <div className='ml-4'>
            <div
              className={`w-full font-medium h-full rounded py-2 px-5 inline-flex items-center justify-center ${
                isClosed ? 'bg-gray-200 text-gray-500' : 'bg-primary text-(--selected-text)'
              }`}>
              {isClosed ? t.closed : t.checkout}
            </div>
          </div>
        </button>
      )}

      <Cart isOpen={isCartOpen} onOpenChange={setIsCartOpen} storeInfo={storeInfo} />
    </>
  );
}
