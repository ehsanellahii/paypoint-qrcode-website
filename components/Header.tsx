/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useLanguage } from '@/lib/language-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { IStoreInfo } from '~/lib/types';
import { getTodayTimings, isRestaurantOpen } from '~/lib/restaurantTimings';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '~/lib/utils';
import DeliveryAddressModal from './dialogs/DeliveryAddressModal';
import { useAddress } from '~/lib/address-context';

type OrderType = 'pickup' | 'delivery' | 'dineIn';

function OrderTypeToggle({
  t,
  value,
  onChange,
  isPickupAvailable,
  isDeliveryAvailable,
  isDineInAvailable,
  className,
}: {
  t: any;
  value: OrderType;
  onChange: (v: OrderType) => void;
  isPickupAvailable: boolean;
  isDeliveryAvailable: boolean;
  isDineInAvailable: boolean;
  className?: string;
}) {
  const options = useMemo(() => {
    const items: { key: OrderType; label: string; available: boolean }[] = [];

    if (isDineInAvailable) {
      items.push({ key: 'dineIn', label: t.dineIn ?? 'Dine In', available: true });
    } else {
      items.push({ key: 'pickup', label: t.pickup ?? 'Pickup', available: isPickupAvailable });
      items.push({ key: 'delivery', label: t.delivery ?? 'Delivery', available: isDeliveryAvailable });
    }

    return items.filter((x) => x.available);
  }, [t, isPickupAvailable, isDeliveryAvailable, isDineInAvailable]);

  if (options.length <= 1) return null;

  return (
    <div className={cn('bg-gray-200 rounded-full flex items-center p-1', className)} role='radiogroup' aria-label='Order type'>
      {options.map((opt) => (
        <button
          key={opt.key}
          type='button'
          role='radio'
          aria-checked={value === opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition',
            value === opt.key ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
          )}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function Header({ storeInfo }: { storeInfo?: IStoreInfo }) {
  const { t } = useLanguage();
  const { close: ClosingHours } = getTodayTimings(storeInfo?.timings);
  const isOpen = isRestaurantOpen(storeInfo?.timings || {});

  const isPickupAvailable = storeInfo?.settings?.orderTypes?.takeaway ?? true;
  const isDeliveryAvailable = storeInfo?.settings?.orderTypes?.delivery ?? false;
  const isDineInAvailable = false; // storeInfo?.settings?.orderTypes?.dineIn ?? false;

  // const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  // const [deliveryAddress, setDeliveryAddress] = useState<boolean | null>(null);
  const { orderType, setOrderType, deliveryAddress, setDeliveryAddress } = useAddress();
  const onChooseDelivery = () => {
    setOrderType('delivery');
    setIsDeliveryModalOpen(true);
  };
  // ✅ Auto-fallback if default isn't available
  useEffect(() => {
    const available: OrderType[] = [];

    if (isDineInAvailable) available.push('dineIn');
    else {
      if (isPickupAvailable) available.push('pickup');
      if (isDeliveryAvailable) available.push('delivery');
    }

    if (available.length === 0) return;

    if (!available.includes(orderType)) {
      setOrderType(available[0]); // first available becomes selected
    }
  }, [isPickupAvailable, isDeliveryAvailable, isDineInAvailable, orderType]);

  return (
    <>
      <header className='hidden lg:block bg-white border-b border-gray-100' role='banner'>
        <div className='flex items-center lg:px-6 py-3 lg:py-4'>
          {/* Left section */}
          <div className='flex grow items-center'>
            <div className='md:mr-2'>
              <OrderTypeToggle
                t={t}
                value={orderType}
                onChange={(v) => {
                  if (v === 'delivery') {
                    onChooseDelivery();
                  } else {
                    setOrderType(v);
                  }
                }}
                isPickupAvailable={isPickupAvailable}
                isDeliveryAvailable={isDeliveryAvailable}
                isDineInAvailable={isDineInAvailable}
                className='mr-2'
              />
            </div>

            {orderType === 'delivery' && deliveryAddress && (
              <button
                onClick={() => setIsDeliveryModalOpen(true)}
                className='mt-2 bg-gray-100 hover:bg-gray-200 transition rounded-full px-4 py-2 text-sm text-left'
                aria-label='Change delivery address'>
                <div className='font-medium text-gray-800'>Deliver to</div>
                <div className='text-gray-600 truncate max-w-[320px]'>
                  {deliveryAddress.streetNumber} {deliveryAddress.route}, {deliveryAddress.postalCode} {deliveryAddress.locality}
                </div>
              </button>
            )}

            {/* Store hours badge */}
            <div className='bg-gray-200 rounded-full px-4 py-3 flex items-center text-sm mr-2' role='status' aria-label='Store hours'>
              {isOpen ? (
                <p className='font-medium text-gray-700 whitespace-nowrap'>
                  {t.openUntil} {ClosingHours}
                </p>
              ) : (
                <p className='font-medium text-red-600 whitespace-nowrap'>{t.closed}</p>
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
      <DeliveryAddressModal
        open={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSelect={(addr) => {
          setDeliveryAddress(addr); // ✅ persisted + global
          setIsDeliveryModalOpen(false);
        }}
        googleApiKey={storeInfo?.posGoogleApiKey || ''}
      />
    </>
  );
}
