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
      <div className='flex-1 overflow-y-auto scrollbar-hide px-6 py-4'>
        {loading ? (
          <div className='py-6 text-center text-muted-foreground'>{t.loading}</div>
        ) : products.length === 0 ? (
          <div className='py-6 text-center text-muted-foreground'>{t.noFavoriteItemsYet}</div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
      <div className='flex items-center justify-between border-t border-border bg-card px-6 py-4'>
        <div className='text-sm text-muted-foreground'>
          <span>
            {t.totalFavItems} <span className='font-bold text-foreground'>{products.length}</span>
          </span>
        </div>

        <button onClick={() => handleOpenChange(false)} className='rounded-[12px] bg-surface-3 px-4 py-3 font-bold text-white transition hover:bg-elevated'>
          {t?.close ?? 'Close'}
        </button>
      </div>
    </DialogWrapper>
  );
};

export default FavoriteItemsDialog;
