'use client';

import Image from 'next/image';
import LanguageSwitcher from './LanguageSwitcher';
import { IStoreInfo } from '~/lib/types';
import { useLanguage } from '~/lib/language-context';
import { getTodayTimings, isRestaurantOpen } from '~/lib/restaurantTimings';
import OrderTypeAndAddressControl from './OrderTypeAndAddressControl';

export default function MobileRestaurantInfo({ storeInfo }: { storeInfo?: IStoreInfo }) {
  const { t } = useLanguage();
  const { close: ClosingHours } = getTodayTimings(storeInfo?.timings);
  const isOpen = isRestaurantOpen(storeInfo?.timings || {});
  return (
    <div className='lg:hidden bg-white' role='banner' aria-label='Restaurant information'>
      <div className='px-4 pb-6 pt-5'>
        {/* Logo */}
        <div className='flex flex-col items-center'>
          <div className='flex justify-center'>
            <div className='relative w-20 h-32 md:w-32 md:h-48'>
              <Image src={storeInfo?.logo || ''} alt={storeInfo?.brandName || 'Restaurant Logo'} fill className='object-contain' sizes='140px' />
            </div>
          </div>
          {/* Restaurant Name */}
          <h1 className='text-lg md:text-2xl font-bold text-center text-gray-900 '>{storeInfo?.brandName || ''}</h1>
        </div>

        {/* Address */}
        <p className='text-sm text-center text-gray-600 mb-3'>{storeInfo?.address || ''}</p>
        {/* Flag */}
        <div className='flex justify-center'>
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
        <OrderTypeAndAddressControl storeInfo={storeInfo} />
      </div>
    </div>
  );
}
