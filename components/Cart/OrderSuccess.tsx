'use client';

import { Check, FileText, MapPin, CreditCard, Loader2, HelpCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '~/contexts/language-context';
import { useCart } from '~/contexts/cart-context';
import { useAddress } from '~/contexts/address-context';
import { useStore } from '~/contexts/store-context';
import { getImageURL } from '~/lib/utils';
import { formatPrice } from '@/lib/api';

type Props = {
  lastOrderId: string;
  onSuccess: () => void;
  step: 'success' | 'details' | 'payment';
  isDelivery?: boolean;
  paymentName?: string;
  total?: number;
  etaLo?: number;
  etaHi?: number;
  /** Explicit window for scheduled/pre-orders; overrides the computed ETA. */
  etaLabel?: string;
};

const DARK_MAP_STYLE = [
  'feature:all|element:geometry|color:0x1c1c1e',
  'feature:all|element:labels.text.fill|color:0x8a8d93',
  'feature:all|element:labels.text.stroke|color:0x1c1c1e|weight:2',
  'feature:all|element:labels.icon|visibility:off',
  'feature:poi|element:geometry|color:0x242428',
  'feature:poi.business|visibility:off',
  'feature:road|element:geometry|color:0x2e2e34',
  'feature:road|element:labels|visibility:off',
  'feature:water|element:geometry|color:0x17232e',
];

function buildStaticMap(lat: number, lng: number, key: string) {
  if (!lat || !lng || !key) return '';
  let url = `https://maps.googleapis.com/maps/api/staticmap?size=560x260&scale=2&maptype=roadmap&center=${lat},${lng}&zoom=15`;
  DARK_MAP_STYLE.forEach((s) => (url += `&style=${encodeURIComponent(s)}`));
  url += `&markers=${encodeURIComponent(`size:mid|color:0xffffff|${lat},${lng}`)}`;
  url += `&key=${key}`;
  return url;
}

const OrderSuccess = ({ lastOrderId, onSuccess, isDelivery = true, paymentName, total, etaLo = 30, etaHi = 40, etaLabel }: Props) => {
  const { t } = useLanguage();
  const { cart, totalPrice } = useCart();
  const { deliveryAddress } = useAddress();
  const storeInfo = useStore();

  const now = Date.now();
  const fmtTime = (ms: number) => {
    const d = new Date(ms);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  // Scheduled/pre-orders carry an explicit window; otherwise derive from now.
  const eta = etaLabel ?? `${fmtTime(now + etaLo * 60000)} – ${fmtTime(now + etaHi * 60000)}`;
  const isScheduled = !!etaLabel;

  const mapKey = storeInfo?.posGoogleApiKey || storeInfo?.adminGoogleApiKey || '';
  const mapUrl = isDelivery && deliveryAddress ? buildStaticMap(deliveryAddress.lat, deliveryAddress.lng, mapKey) : '';

  const grandTotal = total ?? totalPrice;
  const orderNo = lastOrderId || '—';
  const addrValue = isDelivery && deliveryAddress ? deliveryAddress.formattedAddress : `${storeInfo?.brandName ?? ''} · ${storeInfo?.address ?? ''}`;

  return (
    <div className='flex h-full flex-col overflow-y-auto scrollbar-hide'>
      <div className='px-6 pb-6 pt-8'>
        {/* Success hero */}
        <div className='flex flex-col items-center text-center'>
          <div className='relative flex h-[84px] w-[84px] items-center justify-center'>
            <div className='absolute inset-0 rounded-full bg-success/10' />
            <div className='absolute inset-[11px] rounded-full bg-success/20' />
            <div className='anim-pop relative flex h-[54px] w-[54px] items-center justify-center rounded-full bg-success'>
              <Check className='h-7 w-7 text-[#0f2a1a]' strokeWidth={2.6} />
            </div>
          </div>
          <h1 className='mt-4 text-[26px] font-extrabold tracking-tight'>{t.orderConfirmed ?? 'Order confirmed'}</h1>
          <p className='mt-2 max-w-[380px] text-sm font-medium leading-relaxed text-muted-foreground'>
            {isDelivery ? (t.orderConfirmedDeliverySub ?? 'The kitchen is preparing your food.') : (t.orderConfirmedPickupSub ?? 'The kitchen is preparing your food.')}
          </p>
        </div>

        {/* Tracking card */}
        <div className='mt-6 overflow-hidden rounded-[22px] border border-border bg-surface-1'>
          <div className='relative h-[200px] bg-surface-3 bg-cover bg-center' style={mapUrl ? { backgroundImage: `url(${mapUrl})` } : { background: 'linear-gradient(135deg,#26262a,#141416)' }}>
            <div className='absolute left-4 top-4 inline-flex h-[34px] items-center gap-2 rounded-[11px] bg-[rgba(15,15,17,0.78)] px-3.5 text-[12.5px] font-bold text-success backdrop-blur'>
              <span className='h-2 w-2 rounded-full bg-success shadow-[0_0_0_4px_rgba(70,209,127,0.25)]' />
              {isScheduled ? (t.preorder ?? 'Pre-ordered') : (t.inProgress ?? 'In progress')}
            </div>
          </div>
          <div className='p-5'>
            <div className='text-[13px] font-semibold text-muted-foreground'>{isDelivery ? (t.estimatedDelivery ?? 'Estimated delivery') : (t.readyForPickup ?? 'Ready for pickup')}</div>
            <div className='mt-1 text-[30px] font-extrabold tracking-tight'>{eta}</div>
            <div className='mt-4 flex gap-1.5'>
              <div className='h-[5px] flex-1 rounded-[3px] bg-success' />
              <div className='h-[5px] flex-1 rounded-[3px] bg-[#3a3c40]' />
              <div className='h-[5px] flex-1 rounded-[3px] bg-[#3a3c40]' />
            </div>
            <div className='mt-2.5 flex justify-between text-xs font-semibold text-muted-foreground'>
              <span className='text-white'>{t.preparation ?? 'Preparation'}</span>
              <span>{isDelivery ? (t.onTheWay ?? 'On the way') : (t.ready ?? 'Ready')}</span>
              <span>{isDelivery ? (t.delivered ?? 'Delivered') : (t.pickedUp ?? 'Picked up')}</span>
            </div>
          </div>
        </div>

        {/* Courier assignment (delivery) */}
        {isDelivery && (
          <div className='mt-4 flex items-center gap-3 rounded-[18px] border border-border bg-surface-1 p-4'>
            <div className='flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-card'>
              <Loader2 className='h-[18px] w-[18px] animate-spin text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-[15px] font-bold'>{t.courierBeingAssigned ?? 'Courier being assigned'}</div>
              <div className='mt-0.5 text-[12.5px] font-medium text-muted-foreground'>{t.courierBeingAssignedSub ?? 'You’ll be notified once someone is on the way'}</div>
            </div>
          </div>
        )}

        {/* Info cards */}
        <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='flex items-center gap-3 rounded-2xl border border-border bg-surface-1 p-4'>
            <FileText className='h-5 w-5 shrink-0 text-muted-foreground' />
            <div className='min-w-0'>
              <div className='text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground'>{t.orderNumber ?? 'Order number'}</div>
              <div className='mt-0.5 text-[14.5px] font-extrabold'>{orderNo}</div>
            </div>
          </div>
          <div className='flex items-center gap-3 rounded-2xl border border-border bg-surface-1 p-4'>
            <MapPin className='h-5 w-5 shrink-0 text-muted-foreground' />
            <div className='min-w-0'>
              <div className='text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground'>{isDelivery ? (t.deliverTo ?? 'Delivery to') : (t.pickupAt ?? 'Pickup at')}</div>
              <div className='mt-0.5 truncate text-[13px] font-semibold'>{addrValue}</div>
            </div>
          </div>
          <div className='flex items-center gap-3 rounded-2xl border border-border bg-surface-1 p-4'>
            <CreditCard className='h-5 w-5 shrink-0 text-muted-foreground' />
            <div className='min-w-0'>
              <div className='text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground'>{t.payment ?? 'Payment'}</div>
              <div className='mt-0.5 text-[13px] font-semibold'>{paymentName ?? '—'}</div>
            </div>
          </div>
          <a href={storeInfo?.phone ? `tel:${storeInfo.phone}` : '#'} className='flex items-center gap-3 rounded-2xl border border-border bg-surface-1 p-4 transition hover:bg-surface-2'>
            <HelpCircle className='h-5 w-5 shrink-0 text-muted-foreground' />
            <div className='min-w-0 flex-1'>
              <div className='text-[13px] font-bold'>{t.problemWithOrder ?? 'Problem with your order?'}</div>
              <div className='mt-0.5 text-[12px] font-medium text-muted-foreground'>{t.helpAndSupport ?? 'Help & support'}</div>
            </div>
            <ChevronRight className='h-4 w-4 shrink-0 text-[#55575c]' />
          </a>
        </div>

        {/* Order summary */}
        <div className='mt-4 rounded-2xl border border-border bg-surface-1 p-5'>
          <div className='text-[12px] font-bold uppercase tracking-[0.04em] text-muted-foreground'>{t.yourOrder ?? 'Your order'}</div>
          <div className='mt-4 flex flex-col gap-3.5'>
            {cart.map((item) => {
              const img = item.product.images?.length ? getImageURL(item.product.images[0]) : '';
              return (
                <div key={item.id} className='flex items-center gap-3'>
                  <div className='w-6 shrink-0 text-sm font-extrabold'>{item.quantity}×</div>
                  <div className='h-[42px] w-[42px] shrink-0 rounded-[11px] bg-white bg-cover bg-center' style={img ? { backgroundImage: `url(${img})` } : undefined} />
                  <div className='min-w-0 flex-1 text-[13.5px] font-semibold leading-tight text-[#e7e8ea]'>{item.product.name}</div>
                  <div className='shrink-0 text-sm font-bold'>{formatPrice(item.product.currentPrice * item.quantity)}</div>
                </div>
              );
            })}
          </div>
          <div className='mt-4 flex items-baseline justify-between border-t border-border pt-4'>
            <span className='text-[15px] font-extrabold'>{t.total ?? 'Total'}</span>
            <span className='text-xl font-extrabold'>{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className='mt-auto shrink-0 border-t border-border px-6 py-4'>
        <button onClick={onSuccess} className='h-14 w-full rounded-2xl bg-primary text-[15px] font-extrabold text-selected-text transition active:scale-[0.98]'>
          {t.backToHome ?? 'Back to home'}
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
