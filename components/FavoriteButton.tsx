/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { isFavorite, toggleFavorite } from '~/lib/favorites';
import { useStore } from '~/contexts/store-context';
import { useUser } from '~/contexts/user-context';

export default function FavoriteButton({
  storeKey,
  productId,
  name,
  image,
  price,
}: {
  storeKey: string;
  productId: string;
  name?: string;
  image?: string;
  price?: number;
}) {
  const storeInfo = useStore();
  const { user } = useUser(); // ✅ fix your hook usage
  const customerId = user?._id;

  const [fav, setFav] = useState(false);

  const syncFav = useCallback(() => {
    const key = storeInfo?.slug ?? storeKey;
    setFav(isFavorite(key, productId));
  }, [storeInfo?.slug, storeKey, productId]);

  useEffect(() => {
    syncFav();

    // ✅ Listen to changes from dialog or anywhere
    window.addEventListener('favorites:changed', syncFav);

    // Optional: also react to cross-tab changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'favorites_v1') syncFav();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('favorites:changed', syncFav);
      window.removeEventListener('storage', onStorage);
    };
  }, [syncFav]);

  return (
    <button
      type="button"
      aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
      className="rounded-full p-2 hover:bg-gray-100"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const slug = storeInfo?.slug ?? storeKey;

        const res = await toggleFavorite({
          adminId: storeInfo?.adminId,
          storeId: storeInfo?.storeId,
          customerId: customerId ?? undefined,
          slug,
          snapshot: { productId, name, image, price },
        });

        // local immediate UI
        setFav(res.isNowFavorite);

        // ensures everyone else updates too
        window.dispatchEvent(new Event('favorites:changed'));
      }}
    >
      <Heart className={`h-5 w-5 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
    </button>
  );
}
