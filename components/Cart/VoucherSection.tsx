'use client';

import React from 'react';
import { Loader2, Tag, X } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useCart } from '~/contexts/cart-context';
import { API_BASE_URL, formatPrice, X_API_KEY } from '@/lib/api';
import type { IStoreInfo } from '~/lib/types';
import { useUser } from '~/contexts/user-context';
import { getTranslatedVoucherApiErrorMessage } from '~/lib/errorMessges';

type Props = {
  storeInfo?: IStoreInfo;
  disabled?: boolean; // disable input + buttons when submitting order etc.
};

export default function VoucherSection({ storeInfo, disabled }: Props) {
  const { user } = useUser();
  const { applyVoucher, removeVoucher, appliedVoucher, discountAmount } = useCart();
  const customerId = user?.id ?? user?._id;
  const { t } = useLanguage();
  const isVoucherApplied = Boolean(appliedVoucher);
  const { totalPrice } = useCart();

  const [voucherCode, setVoucherCode] = React.useState('');
  const [voucherLoading, setVoucherLoading] = React.useState(false);
  const [voucherError, setVoucherError] = React.useState<string | null>(null);

  const onApplyVoucher = async () => {
    setVoucherError(null);

    if (!storeInfo?.storeId) {
      // setVoucherError(t.storeNotFound ?? 'Store not found');
      return;
    }

    const code = voucherCode.trim();
    if (!code) {
      setVoucherError(t.enterVoucherCode ?? 'Enter voucher code');
      return;
    }

    setVoucherLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/vouchers/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': X_API_KEY || '',
        },
        body: JSON.stringify({
          storeId: storeInfo.storeId,
          customerId,
          promoCode: code,
          orderTotalAmount: totalPrice,
        }),
      });
      if (!res.ok) {
        const resError = await res.json();
        console.log('Voucher apply error response:', resError);
        const errorMessage = getTranslatedVoucherApiErrorMessage(resError.errorCode, resError.message, t);
        throw new Error(errorMessage ?? 'Failed to apply voucher');
      }
      const responseData = await res.json();
      console.log('Voucher apply response data:', responseData);
      const { voucher, discountAmount: discount } = responseData.data;
      if (voucher && discount) applyVoucher({ voucher, discountAmount: discount });
      setVoucherCode('');
    } catch (e) {
      setVoucherError(e instanceof Error ? e.message : (t.voucherApplyFailed ?? 'Failed to apply voucher'));
    } finally {
      setVoucherLoading(false);
    }
  };

  const onRemoveVoucher = () => {
    setVoucherError(null);
    removeVoucher();
  };

  return (
    <div className='mt-8 border border-gray-200 bg-white p-4 space-y-3'>
      <div className='flex items-center gap-2 font-semibold text-lg'>
        <Tag className='size-5' />
        <span>{t.voucher ?? 'Voucher'}</span>
      </div>

      {isVoucherApplied && appliedVoucher ? (
        <div className='flex items-center justify-between rounded-md bg-gray-50 p-3'>
          <div className='flex flex-col'>
            {/* <span className='font-semibold'>{appliedVoucher?.code}</span> */}
            <span className='text-sm text-gray-600'>
              {t.discount ?? 'Discount'}: -{formatPrice(discountAmount)}
            </span>
          </div>

          <button
            type='button'
            onClick={onRemoveVoucher}
            className='inline-flex items-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-300'
            disabled={disabled || voucherLoading}>
            <X className='size-4' />
            {t.remove ?? 'Remove'}
          </button>
        </div>
      ) : (
        <>
          <div className='flex gap-2'>
            <input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder={t.enterVoucherCode ?? 'Enter voucher code'}
              className='flex-1 rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-0 focus:ring-primary focus:border-none'
              disabled={disabled || voucherLoading}
            />

            <button
              type='button'
              onClick={onApplyVoucher}
              className='rounded-md bg-primary px-4 py-2 text-(--selected-text) font-medium disabled:opacity-50'
              disabled={disabled || voucherLoading || !voucherCode.trim()}>
              {voucherLoading ? <Loader2 className='size-4 animate-spin' /> : (t.apply ?? 'Apply')}
            </button>
          </div>

          {voucherError && <p className='text-sm text-red-600'>{voucherError}</p>}
        </>
      )}
    </div>
  );
}
