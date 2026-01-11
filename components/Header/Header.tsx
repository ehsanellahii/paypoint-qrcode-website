'use client';

import { useLanguage } from '@/lib/language-context';
import LanguageSwitcher from '~/components/Header/LanguageSwitcher';
import { IStoreInfo } from '~/lib/types';
import { getTodayTimings, isRestaurantOpen } from '~/lib/restaurantTimings';
import OrderTypeAndAddressControl from './OrderTypeAndAddressControl';

export default function Header({ storeInfo }: { storeInfo?: IStoreInfo }) {
  const { t } = useLanguage();
  const { close: ClosingHours } = getTodayTimings(storeInfo?.timings);
  const isOpen = isRestaurantOpen(storeInfo?.timings || {});

  return (
    <>
      <header className='hidden lg:block bg-white border-b border-gray-100' role='banner'>
        <div className='flex items-center lg:px-6 py-3 lg:py-4'>
          {/* Left section */}
          <div className='flex grow items-center'>
            <OrderTypeAndAddressControl storeInfo={storeInfo} />

            {/* Store hours badge */}
            <div className='bg-gray-200 rounded-full px-4 py-3 flex items-center text-sm mr-2' role='status' aria-label='Store hours'>
              {isOpen ? (
                <p className='font-medium text-gray-700 whitespace-nowrap'>
                  Online {t.openUntil} {ClosingHours}
                </p>
              ) : (
                <p className='font-medium text-red-600 whitespace-nowrap'>Online {t.closed}</p>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className='flex items-center'>
            <div className='bg-gray-200 rounded-full py-3 px-4 flex items-center text-sm mr-2' role='contentinfo' aria-label='Store location'>
              <div className='font-semibold mr-3'>{storeInfo?.brandName}</div>
              <div className='text-gray-600'>{storeInfo?.address}</div>
            </div>

            <LanguageSwitcher />

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeInfo?.address || '')}`}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-gray-200 ml-3 rounded-full py-3 px-4 flex items-center text-sm'
              aria-label='View location on Google Maps'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width={16}
                height={16}
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-gray-500 mr-1'>
                <polygon points='3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21' />
                <line x1={9} y1={3} x2={9} y2={18} />
                <line x1={15} y1={6} x2={15} y2={21} />
              </svg>
              <span className='text-sm font-medium'>{t.location}</span>
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
