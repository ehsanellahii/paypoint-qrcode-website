import React from 'react';
import { Banknote, CreditCard, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useCart } from '~/contexts/cart-context';
import { formatPrice } from '@/lib/api';
import VoucherSection from './VoucherSection';
import { useStore } from '~/contexts/store-context';

const PaymentMethodForm = ({
  onBack,
  onSuccess,
  isSubmitting,
  deliveryCharges,
}: {
  onBack: () => void;
  onSuccess: (paymentMethod: 'cash' | 'card' | null) => void;
  isSubmitting: boolean;
  deliveryCharges: number;
}) => {
  const storeInfo = useStore();
  const { t } = useLanguage();
  const { totalPrice, discountAmount } = useCart();

  const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'card' | null>(null);
  const isCashAvailable = storeInfo?.settings?.paymentMethods?.cash;
  const isCardAvailable = storeInfo?.settings?.paymentMethods?.ecCardReader;

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto px-6 py-8'>
        <div className='flex flex-wrap gap-4 '>
          {isCashAvailable && (
            <button
              type='button'
              onClick={() => setPaymentMethod('cash')}
              className={`h-40 w-44 p-4 md:p-8 rounded-lg border-2 flex flex-col items-center  gap-4 font-bold text-xl transition-all ${
                paymentMethod === 'cash' ? 'bg-primary border-primary text-(--selected-text)' : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
              }`}>
              <div className={`size-12 rounded-full flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-white/20' : 'bg-gray-100'}`}>
                <Banknote className='size-6' />
              </div>
              {t.cash}
            </button>
          )}
          {isCardAvailable && (
            <button
              type='button'
              onClick={() => setPaymentMethod('card')}
              className={`h-40 w-44 p-4 md:p-8 rounded-lg border-2 flex flex-col text-wrap items-center  gap-4 font-bold text-xl transition-all ${
                paymentMethod === 'card' ? 'bg-primary border-primary text-(--selected-text)' : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
              }`}>
              <div className={`size-12 rounded-full flex items-center justify-center ${paymentMethod === 'card' ? 'bg-white/20' : 'bg-gray-100'}`}>
                <CreditCard className='size-6' />
              </div>
              {t.posCardPayment}
            </button>
          )}
        </div>
      </div>
      <VoucherSection disabled={isSubmitting} />
      <div className='border-t border-gray-300 px-6 py-4 space-y-3 bg-white'>
        <div className='flex items-center justify-between text-lg font-bold'>
          <span>{t.totalIncludingVAT}</span>
          <span>{formatPrice(totalPrice - discountAmount + (deliveryCharges ?? 0))}</span>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <button
            type='button'
            onClick={onBack}
            className='py-3 px-4 rounded bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors'
            disabled={isSubmitting}>
            {t.back}
          </button>
          <button
            type='button'
            onClick={() => {
              if (onSuccess) onSuccess(paymentMethod);
            }}
            className='py-3 px-4 rounded bg-primary text-(--selected-text) font-medium hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
            disabled={isSubmitting || !paymentMethod}>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t.placingOrder}
              </>
            ) : (
              t.pay
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
