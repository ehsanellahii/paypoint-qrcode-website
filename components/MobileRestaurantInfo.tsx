'use client';

import Image from 'next/image';
import { restaurantInfo } from '@/lib/api';
import LanguageSwitcher from './LanguageSwitcher';
import { IStoreInfo } from '~/lib/types';
import { useLanguage } from '~/lib/language-context';
import { getTodayTimings, isRestaurantOpen } from '~/lib/restaurantTimings';

export default function MobileRestaurantInfo({ storeInfo }: { storeInfo?: IStoreInfo }) {
  const { t } = useLanguage();
  const { close: ClosingHours } = getTodayTimings(storeInfo?.timings);
  const isOpen = isRestaurantOpen(storeInfo?.timings || {});
  return (
    <div className='lg:hidden bg-white' role='banner' aria-label='Restaurant information'>
      <div className='px-4 pb-6 pt-5'>
        {/* Logo */}
        <div className='flex justify-center mb-4'>
          <div className='relative w-32 h-48'>
            <Image src={storeInfo?.logo || restaurantInfo.logo} alt={storeInfo?.brandName || 'Restaurant Logo'} fill className='object-contain' sizes='140px' />
          </div>
        </div>

        {/* Restaurant Name */}
        <h1 className='text-2xl font-bold text-center text-gray-900 mb-2'>{storeInfo?.brandName || restaurantInfo.name}</h1>

        {/* Address */}
        <p className='text-sm text-center text-gray-600 mb-3'>{storeInfo?.address || restaurantInfo.address}</p>

        {/* Flag */}
        <div className='flex justify-center mb-3'>
          <div className='bg-gray-100 rounded-full px-4 py-2'>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Opening Hours */}
        <div className='flex justify-center'>
          {isOpen ? (
            <p className='text-sm font-medium text-gray-900' role='status'>
              {t.openUntil} {ClosingHours}
            </p>
          ) : (
            <p className='font-medium text-red-600 whitespace-nowrap'>{t.closed}</p>
          )}
        </div>
      </div>
    </div>
  );
}
