'use client';

import React from 'react';
import DialogWrapper from '~/components/DialogWrapper';
import { useResolvedFavorites } from './useResolvedFavorites';
import { useStore } from '~/contexts/store-context';
import ProductCard from '~/components/ProductCard';
import { useLanguage } from '~/contexts/language-context';
import { MenuProduct } from '~/lib/utils';

const FavoriteItemsDialog = ({
  isOpen,
  handleOpenChange,
  openProductDetailsCallback,
}: {
  isOpen: boolean;
  handleOpenChange: (open: boolean) => void;
  openProductDetailsCallback: (product: MenuProduct) => void;
}) => {
  const { t } = useLanguage();
  const storeInfo = useStore();
  const adminId = storeInfo?.adminId || '';
  const storeId = storeInfo?.storeId || '';
  const storeKey = storeInfo?.slug || 'default';
  const { products, loading } = useResolvedFavorites(storeKey, isOpen, storeId, adminId);

  return (
    <DialogWrapper isOpen={isOpen} handleOpenChange={handleOpenChange} title='Favorite Items' isWithCrossIcon>
      <div className='flex-1 overflow-y-auto'>
        {loading ? (
          <div className='py-6 text-center'>{t.loading}</div>
        ) : products.length === 0 ? (
          <div className='py-6 text-center text-gray-500'>{t.noFavoriteItemsYet}</div>
        ) : (
          <div className='space-y-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onClick={() => {
                  handleOpenChange(false);
                  openProductDetailsCallback(p);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className='border-t border-gray-300 px-6 py-4 bg-white flex items-center justify-between'>
        <div className='text-sm text-gray-600'>
          <span>
            {t.totalFavItems} <span className='font-semibold text-gray-900'>{products.length}</span>
          </span>
        </div>

        <button onClick={() => handleOpenChange(false)} className='py-3 px-4 rounded bg-gray-200 font-medium'>
          {t?.close ?? 'Close'}
        </button>
      </div>
    </DialogWrapper>
  );
};

export default FavoriteItemsDialog;
