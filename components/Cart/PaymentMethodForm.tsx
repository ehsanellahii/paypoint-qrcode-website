import React from 'react';
import { Banknote, CreditCard, Loader2, Check, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useCart } from '~/contexts/cart-context';
import { formatPrice } from '@/lib/api';
import VoucherSection from './VoucherSection';
import { useStore } from '~/contexts/store-context';
import { cn } from '~/lib/utils';
import { useAddress } from '~/contexts/address-context';

const TIP_VALUES = [0, 1, 2, 3];

const PaymentMethodForm = ({
  onBack,
  onSuccess,
  isSubmitting,
  deliveryCharges,
  priorityFee = 0,
  tip,
  onTipChange,
}: {
  onBack: () => void;
  onSuccess: (paymentMethod: 'cash' | 'card' | null) => void;
  isSubmitting: boolean;
  deliveryCharges: number;
  priorityFee?: number;
  tip: number;
  onTipChange: (v: number) => void;
}) => {
  const storeInfo = useStore();
  const { t } = useLanguage();
  const { totalPrice, discountAmount } = useCart();
  const { orderType } = useAddress();
  const isDelivery = orderType === 'delivery';

  const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'card' | null>(null);
  const isCashAvailable = storeInfo?.settings?.paymentMethods?.cash;
  const isCardAvailable = storeInfo?.settings?.paymentMethods?.ecCardReader;

  const grandTotal = totalPrice - discountAmount + (deliveryCharges ?? 0) + priorityFee + tip;

  const methodRow = (method: 'cash' | 'card', Icon: typeof Banknote, label: string) => {
    const active = paymentMethod === method;
    return (
      <button
        type='button'
        onClick={() => setPaymentMethod(method)}
        className={cn(
          'flex w-full items-center gap-3.5 rounded-[14px] border-2 p-4 text-left transition',
          active ? 'border-white bg-surface-3' : 'border-transparent bg-surface-1 hover:bg-surface-2'
        )}>
        <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-3'>
          <Icon className='h-5 w-5' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[15px] font-bold'>{label}</span>
          <span className='mt-0.5 block text-[12.5px] font-medium text-muted-foreground'>{isDelivery ? (t.onDelivery ?? 'On delivery') : (t.onPickup ?? 'On pickup')}</span>
        </span>
        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-white bg-white' : 'border-[#55575c]')}>
          {active && <Check className='h-[13px] w-[13px] text-black' strokeWidth={2.8} />}
        </span>
      </button>
    );
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto scrollbar-hide px-6 py-6'>
        <div className='text-[12.5px] font-bold uppercase tracking-[0.04em] text-white'>{t.paymentMethod}</div>
        <div className='mt-3 flex flex-col gap-2.5'>
          {isCashAvailable && methodRow('cash', Banknote, t.cash)}
          {isCardAvailable && methodRow('card', CreditCard, t.posCardPayment)}
        </div>

        {/* Tipping */}
        <div className='mt-7 text-[12.5px] font-bold uppercase tracking-[0.04em] text-white'>
          {t.tip ?? 'Tip'} <span className='font-medium normal-case text-muted-foreground-2'>· {isDelivery ? (t.tipToDriver ?? '100% to the driver') : (t.tipToTeam ?? '100% to the team')}</span>
        </div>
        <div className='mt-3 flex flex-wrap gap-2.5'>
          {TIP_VALUES.map((v) => {
            const active = tip === v;
            return (
              <button
                key={v}
                type='button'
                onClick={() => onTipChange(v)}
                className={cn(
                  'h-11 flex-1 rounded-xl border text-[13.5px] font-bold transition',
                  active ? 'border-white bg-primary text-selected-text' : 'border-border-strong bg-transparent text-white hover:bg-surface-1'
                )}>
                {v === 0 ? (t.noTip ?? 'None') : formatPrice(v)}
              </button>
            );
          })}
        </div>
        {tip > 0 && (
          <div className='mt-2 flex items-center gap-2 text-[12.5px] font-semibold text-[#b9bbbf]'>
            <Heart className='h-3.5 w-3.5 fill-[#e8859a] text-[#e8859a]' />
            {isDelivery ? (t.tipThanksDriver ?? 'Thank you! Your driver receives 100% of the tip.') : (t.tipThanksTeam ?? 'Thank you! The team receives 100% of the tip.')}
          </div>
        )}

        <VoucherSection disabled={isSubmitting} />
      </div>

      <div className='shrink-0 space-y-3 border-t border-border bg-card px-6 py-4'>
        <div className='flex items-center justify-between text-lg font-extrabold'>
          <span>{t.totalIncludingVAT}</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <button type='button' onClick={onBack} className='rounded-[14px] bg-surface-3 px-4 py-3.5 font-bold text-white transition hover:bg-elevated' disabled={isSubmitting}>
            {t.back}
          </button>
          <button
            type='button'
            onClick={() => onSuccess(paymentMethod)}
            className='flex items-center justify-center rounded-[14px] bg-primary px-4 py-3.5 font-extrabold text-selected-text transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
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
