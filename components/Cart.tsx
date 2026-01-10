'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { formatPrice as apiFormatPrice } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CheckoutForm from './CheckoutForm';
import { IStoreInfo } from '~/lib/types';
import { cn, getImageURL, getPostalRateInfo } from '~/lib/utils';
import { useAddress } from '~/lib/address-context';

interface CartProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  storeInfo?: IStoreInfo;
}

export default function Cart({ isOpen: controlledIsOpen, onOpenChange, storeInfo }: CartProps = {}) {
  const { cart, updateQuantity, totalPrice } = useCart();
  const { orderType } = useAddress();
  const { deliveryAddress } = useAddress();
  const { t } = useLanguage();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = onOpenChange ?? setInternalIsOpen;
  const postalRateInfo = getPostalRateInfo(Number(deliveryAddress?.postalCode || 0), storeInfo?.postalRates || []);
  const isDeliveryAvailable = postalRateInfo.isAvailable;

  const deliveryCharges = postalRateInfo.deliveryCharges;
  const minimumOrderAmount = postalRateInfo.minimumOrderAmount;
  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setIsOpen(false);
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setShowCheckout(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-5xl w-[calc(100vw-2rem)] h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] flex flex-col p-0'>
        {showCheckout ? (
          <CheckoutForm onSuccess={handleCheckoutSuccess} onBack={handleBackToCart} storeInfo={storeInfo} />
        ) : (
          <>
            <DialogHeader className='p-6 pb-0 border-b-0'>
              <DialogTitle className='text-3xl border-b py-8 border-gray-300 font-bold text-center'>{t.order}</DialogTitle>
            </DialogHeader>

            {/* CART ITEMS */}
            <div className='flex-1 overflow-y-auto px-6 py-4 space-y-3' role='list'>
              {cart.map((item) => (
                <div key={item.id} className='bg-gray-100 rounded-lg p-4 flex items-center gap-3' role='listitem'>
                  {/* Image */}
                  <div className='relative w-16 h-16 shrink-0 rounded overflow-hidden'>
                    <Image
                      src={item.product.images.length ? getImageURL(item.product.images[0]) : '/'}
                      alt={item.product.name}
                      fill
                      className='object-cover'
                      sizes='64px'
                    />
                  </div>

                  {/* Details */}
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-900 text-sm'>{item.product.name}</h3>

                    {/* ADD-ONS WITH QUANTITIES */}
                    {Object.keys(item.customizations).length > 0 && (
                      <div className='mt-1 text-sm text-gray-600 space-y-0.5'>
                        {Object.entries(item.customizations).map(([sectionId, group]) => {
                          const section = item.product.addOns.find((s) => s._id === sectionId);
                          if (!section) return null;

                          return (
                            <div key={sectionId}>
                              {Object.entries(group).map(([optionId, qty]) => {
                                if (qty <= 0) return null;
                                const opt = section.options.find((o) => o._id === optionId);
                                if (!opt) return null;

                                return (
                                  <p key={optionId}>
                                    {opt.name}
                                    {qty > 1 && ` × ${qty}`}
                                  </p>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && <p className='mt-0.5 text-xs text-gray-500 italic'>{item.notes}</p>}
                  </div>

                  {/* Quantity Controls */}
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className='w-10 h-10 rounded bg-[#ffc338] flex items-center justify-center font-bold'>
                      −
                    </button>

                    <span className='font-medium min-w-6 text-center'>{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className='w-10 h-10 rounded bg-[#ffc338] flex items-center justify-center font-bold'>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className='border-t border-gray-300 px-6 py-4 space-y-3 bg-white'>
              {orderType === 'pickup' && (
                <div className='flex justify-between font-bold'>
                  <span>{t.deliveryCharges}</span>
                  <span>{deliveryCharges != null && isDeliveryAvailable ? apiFormatPrice(deliveryCharges) : t.notAvailable}</span>
                </div>
              )}
              <div className='flex justify-between font-bold'>
                <span>{t.totalIncludingVAT}</span>
                <span>{deliveryCharges != null && isDeliveryAvailable ? apiFormatPrice(totalPrice + (orderType  === "pickup" ? deliveryCharges : 0)) : apiFormatPrice(totalPrice)}</span>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <button onClick={() => setIsOpen(false)} className='py-3 px-4 rounded bg-gray-200 font-medium'>
                  {t.close}
                </button>

                <button
                  onClick={() => {
                    if (!isDeliveryAvailable) {
                      alert(t.weAreNotAvailableInYourArea);
                      return;
                    }
                    if (minimumOrderAmount != null && totalPrice < minimumOrderAmount) {
                      alert(t.minimumOrderAmountIs + ' ' + apiFormatPrice(minimumOrderAmount));
                      return;
                    }
                    setShowCheckout(true);
                  }}
                  className={cn('py-3 px-4 rounded bg-[#ffc338] font-medium', !isDeliveryAvailable && 'opacity-50 cursor-not-allowed')}>
                  {t.next}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
