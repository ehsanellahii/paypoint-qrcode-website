/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import LanguageSwitcher from '~/components/Header/LanguageSwitcher';
import { IStoreInfo } from '~/lib/types';
import { getTodayTimings, isRestaurantOpen } from '~/lib/restaurantTimings';
import OrderTypeAndAddressControl from './OrderTypeAndAddressControl';
import UserDrawer from './UserDrawer';
import OrdersDialog from './OrdersDialog';

export default function Header({ storeInfo }: { storeInfo?: IStoreInfo }) {
  const { t } = useLanguage();
  const { close: ClosingHours } = getTodayTimings(storeInfo?.timings);
  const isOpen = isRestaurantOpen(storeInfo?.timings || {});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  return (
    <>
      <header className='hidden lg:block bg-white border-b border-gray-100' role='banner'>
        <div className='flex items-center lg:px-6 py-3 lg:py-4'>
          {/* Left section */}
          <div className='flex grow items-center'>
            {!storeInfo?.tableInfo?.token && <OrderTypeAndAddressControl storeInfo={storeInfo} />}

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
              <span className='text-sm font-medium'>{t.location}</span>
            </a>

            <button className='rounded hover:bg-gray-100 ml-1 p-1' onClick={() => setDrawerOpen(true)} aria-label='Open user menu'>
              <img src='/menu.png' alt='' className='rotate-180 size-10' />
            </button>
          </div>
        </div>
      </header>

      <UserDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onOpenOrders={() => setOrdersOpen(true)} />
      <OrdersDialog open={ordersOpen} onOpenChange={setOrdersOpen} />
    </>
  );
}
