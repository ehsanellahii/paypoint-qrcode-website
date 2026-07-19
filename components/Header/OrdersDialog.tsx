'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Loader2, Receipt } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API_BASE_URL, formatPrice as apiFormatPrice, X_API_KEY } from '@/lib/api';
import { cn, getImageURL } from '~/lib/utils';
import { useUser } from '~/contexts/user-context';
import { useLanguage } from '@/contexts/language-context';
import { useStore } from '~/contexts/store-context';
import SmartImage from '~/lib/SmartImage';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** ---- Types (match what you described) ---- */
type OrderAddOn = {
  id: string;
  uid: string;
  name: string;
  quantity: number;
  price: number;
};

type OrderItem = {
  id: string;
  uid: string;
  quantity: number;
  name: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  discountType: string;
  totalPrice: number;
  image?: string;
  addOns?: OrderAddOn[];
};

type Coordinates = { lat: number; lng: number };

type AddressDetails = {
  address: string;
  postalCode: string;
  coordinates?: Coordinates;
};

type CustomerDetails = {
  name: string;
  phoneNumber?: string;
  email?: string;
};

type StoreDetails = {
  name: string;
  address?: string;
  coordinates?: Coordinates;
};

type Voucher = {
  id: string;
  code?: string;
  title?: string;
  discountType?: string;
  discountAmount?: number;
};

type Order = {
  id: string;
  orderNumber: number;
  collectionCode: string;
  orderDate: string; // ISO string
  orderType: string;
  status: string;
  items: OrderItem[];
  paymentMethod: string;

  totalItemsPrice: number;
  isDiscounted: boolean;
  isVoucherApplied: boolean;
  discountAmount: number;

  totalOrderPrice: number;
  taxRate: number;
  taxAmount: number;

  deliveryTime?: number;
  deliveryCharges?: number;

  storeDetails: StoreDetails;
  customerDetails: CustomerDetails;
  addressDetails?: AddressDetails;

  vouchers?: Voucher[];
};

type OrdersResponse = {
  data: Order[];
  success: boolean;
};

function formatDateTime(iso: string) {
  // simple, no moment dependency
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(); // will use user's locale; if you want fixed, change here
}

function normalizeStatus(status?: string) {
  const s = (status || '').trim();

  // keep exact keys if backend sends these exact values
  // but also be tolerant of casing
  const lower = s.toLowerCase();

  if (lower === 'senttostore') return 'sentToStore';
  if (lower === 'indelivery') return 'inDelivery';
  if (lower === 'isdelivered') return 'isDelivered';
  if (lower === 'iscancelled') return 'isCancelled';

  return s; // fallback
}

function getStatusMeta(status?: string, t?: any) {
  const st = normalizeStatus(status);

  // label shown to user (you can replace with translations)
  const labelMap: Record<string, string> = {
    sentToStore: t?.sentToStore ?? 'Sent to store',
    inDelivery: t?.inDelivery ?? 'In delivery',
    isDelivered: t?.isDelivered ?? 'Delivered',
    isCancelled: t?.isCancelled ?? 'Cancelled',
  };

  const base = 'inline-flex items-center  rounded-full px-2.5 py-1 text-xs font-semibold';

  switch (st) {
    case 'isCancelled':
      return { label: labelMap[st], className: cn(base, 'bg-red-100 text-red-700') };
    case 'isDelivered':
      return { label: labelMap[st], className: cn(base, 'bg-green-100 text-green-700') };
    case 'inDelivery':
      return { label: labelMap[st], className: cn(base, 'bg-blue-100 text-blue-700') };
    case 'sentToStore':
      return { label: labelMap[st], className: cn(base, 'bg-yellow-100 text-yellow-800') };
    default:
      return { label: status || 'Unknown', className: cn(base, 'bg-gray-100 text-foreground') };
  }
}

const getOrderTypeMeta = (type?: string, t?: any) => {
  return type === 'delivery' ? t.delivery : type === 'pickup' ? t.pickup : type === 'dineIn' ? t.dineIn : t.unknown;
};

export default function OrdersDialog({ open, onOpenChange }: Props) {
  const { t } = useLanguage();
  const { user } = useUser(); // adjust if your context differs
  const storeInfo = useStore();
  const logoURL = storeInfo?.settings?.logo || '';
  const userId = user?.id ?? user?._id; // safe fallbacks
  const [didAutoExpand, setDidAutoExpand] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const title = useMemo(() => t?.orders ?? 'Orders', [t]);

  useEffect(() => {
    if (!open) return;
    if (!userId) {
      setOrders([]);
      setErr(null);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(userId)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'x-api-key': X_API_KEY },
          cache: 'no-store',
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `Request failed (${res.status})`);
        }

        const data = (await res.json()) as OrdersResponse | Order[]; // some APIs return array directly
        const list = Array.isArray(data) ? data : (data?.data ?? []);

        if (cancelled) return;
        setOrders(list);
        if (!didAutoExpand && list.length > 0) {
          const first = list.slice().sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0];

          setExpanded({ [first.id]: true });
          setDidAutoExpand(true);
        }
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setDidAutoExpand(false);
      // optional reset
      setExpanded({});
      setErr(null);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-5xl flex-col rounded-3xl border border-border bg-card p-0 text-foreground'>
        <DialogHeader className='p-6 pb-0 border-b-0'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='w-full border-b border-border py-2 text-center font-display text-xl font-extrabold sm:py-4 md:py-8 md:text-3xl'>{title}</DialogTitle>

            {/* optional close icon (Dialog already supports outside click/esc)
            <button className='ml-3 shrink-0 rounded-md p-2 hover:bg-gray-100' onClick={() => handleOpenChange(false)} aria-label={t?.close ?? 'Close'}>
              <X className='h-5 w-5' />
            </button> */}
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className='flex-1 overflow-y-auto px-2 md:px-6 py-4'>
          {!userId ? (
            <EmptyState
              icon={<Receipt className='h-10 w-10' />}
              title={t?.pleaseLogin ?? 'Please login'}
              subtitle={t?.loginToSeeOrders ?? 'Login to see your order history.'}
            />
          ) : loading ? (
            <div className='h-[60vh] flex items-center justify-center'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span>{t?.loading ?? 'Loading...'}</span>
              </div>
            </div>
          ) : err ? (
            <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-700'>
              <div className='font-semibold'>{t?.somethingWentWrong ?? 'Something went wrong'}</div>
              <div className='text-sm mt-1 wrap-break-word'>{err}</div>

              <button
                className='mt-3 rounded bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 border border-red-200'
                onClick={() => {
                  // quick retry: close->open triggers effect, but better is to refetch:
                  // simplest: just reopen state update by calling handleOpenChange twice is ugly;
                  // so we just simulate by toggling open is not possible here.
                  // We'll just run a small trick: call onOpenChange(false) then true
                  // If you don't like this, I can refactor to use a refetch() function.
                  onOpenChange(false);
                  setTimeout(() => onOpenChange(true), 10);
                }}>
                {t?.retry ?? 'Retry'}
              </button>
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<Receipt className='h-10 w-10' />}
              title={t?.noOrdersYet ?? 'No orders yet'}
              subtitle={t?.yourOrdersWillAppearHere ?? 'Your recent orders will appear here.'}
            />
          ) : (
            <div className='space-y-3'>
              {orders
                .slice()
                .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                .map((o) => {
                  const isExpanded = !!expanded[o.id];
                  const itemsCount = o.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) ?? 0;
                  const meta = getStatusMeta(o.status, t);
                  return (
                    <div key={o.id} className='bg-surface-1 rounded-lg overflow-hidden'>
                      {/* summary header */}
                      <button
                        onClick={() => setExpanded((p) => ({ ...p, [o.id]: !p[o.id] }))}
                        className='w-full text-left p-4 hover:bg-surface-2 transition flex items-center gap-3'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between gap-3 flex-wrap'>
                            <div className='font-semibold text-foreground truncate'>
                              {t?.order ?? 'Order'} - {o.collectionCode}
                            </div>
                            <div className='flex justify-end w-full'>
                              <span className={meta.className}>{meta.label}</span>
                            </div>
                          </div>

                          <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground'>
                            <span className='whitespace-nowrap'>{formatDateTime(o.orderDate)}</span>
                            <span className='text-muted-foreground-2'>•</span>
                            <span className='whitespace-nowrap'>{getOrderTypeMeta(o.orderType, t)}</span>
                            <span className='text-muted-foreground-2'>•</span>
                            <span className='whitespace-nowrap'>
                              {itemsCount} {t?.items ?? 'items'}
                            </span>
                            <span className='text-muted-foreground-2'>•</span>
                            <span className='whitespace-nowrap font-semibold text-foreground'>{apiFormatPrice(o.totalOrderPrice)}</span>
                          </div>

                          <div className='mt-1 text-sm text-muted-foreground truncate'>
                            {o.storeDetails?.name}
                            {o.storeDetails?.address ? ` — ${o.storeDetails.address}` : ''}
                          </div>
                        </div>

                        <ChevronDown className={cn('h-5 w-5 text-muted-foreground transition', isExpanded && 'rotate-180')} />
                      </button>

                      {/* expanded details */}
                      {isExpanded && (
                        <div className='border-t border-border bg-card p-4'>
                          {/* Items */}
                          <div className='text-sm font-semibold text-foreground mb-2'>{t?.items ?? 'Items'}</div>

                          <div className='space-y-2'>
                            {o.items?.map((it) => (
                              <>
                                <div key={it.id} className='md:flex gap-3 rounded-lg bg-surface-3 p-3'>
                                  <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white hidden md:block'>
                                    {it.image ? (
                                      <SmartImage fallbackSrc={logoURL} src={getImageURL(it.image)} alt={it.name} fill className='object-cover' sizes='56px' />
                                    ) : logoURL ? (
                                      <div className='relative w-14 h-14 opacity-40 grayscale'>
                                        <Image src={logoURL} alt='Restaurant logo' fill className='object-contain' sizes='56px' />
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className='flex-1 min-w-0'>
                                    <div className='flex items-start justify-between gap-2'>
                                      <div className='min-w-0'>
                                        <div className='font-semibold text-foreground truncate'>
                                          {it.quantity}× {it.name}
                                        </div>

                                        {!!it.addOns?.length && (
                                          <div className='mt-1 text-xs text-muted-foreground space-y-0.5'>
                                            {it.addOns.map((a) => (
                                              <div key={a.id} className='flex items-center justify-between gap-2'>
                                                <span className='truncate'>
                                                  {a.name}
                                                  {a.quantity > 1 ? ` × ${a.quantity}` : ''}
                                                </span>
                                                <span className='shrink-0'>{apiFormatPrice((a.price || 0) * (a.quantity || 1))}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      <div className='text-right shrink-0'>
                                        <div className='font-semibold text-foreground'>{apiFormatPrice(it.totalPrice)}</div>
                                        {(it.discount || 0) > 0 && (
                                          <div className='text-xs text-muted-foreground line-through'>{apiFormatPrice((it.originalPrice || 0) * (it.quantity || 1))}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* <div key={it.id} className='rounded-lg bg-surface-3 p-3 md:hidden'>
                                  <div className='grid grid-cols-[56px_1fr] gap-3'>
                                    <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white'>
                                      <Image src={it.image ? getImageURL(it.image) : '/'} alt={it.name} fill className='object-cover' sizes='56px' />
                                    </div>

                                    <div className='min-w-0'>
                                      <div className='flex items-start justify-between gap-2'>
                                        <div className='min-w-0'>
                                          <div className='font-semibold text-foreground leading-snug break-words'>
                                            <span className='mr-1'>{it.quantity}×</span>
                                            {it.name}
                                          </div>
                                        </div>

                                        <div className='shrink-0 text-right'>
                                          <div className='font-semibold text-foreground whitespace-nowrap'>{apiFormatPrice(it.totalPrice)}</div>
                                          {(it.discount || 0) > 0 && (
                                            <div className='text-xs text-muted-foreground line-through whitespace-nowrap'>
                                              {apiFormatPrice((it.originalPrice || 0) * (it.quantity || 1))}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {!!it.addOns?.length && (
                                        <div className='mt-2 space-y-1'>
                                          {it.addOns.map((a) => (
                                            <div key={a.id} className='flex items-start justify-between gap-2 text-xs text-muted-foreground'>
                                              <div className='min-w-0 pr-2'>
                                                <div className='break-words leading-snug'>
                                                  {a.name}
                                                  {a.quantity > 1 ? ` × ${a.quantity}` : ''}
                                                </div>
                                              </div>
                                              <div className='shrink-0 whitespace-nowrap'>{apiFormatPrice((a.price || 0) * (a.quantity || 1))}</div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div> */}
                              </>
                            ))}
                          </div>

                          {/* Totals */}
                          <div className='mt-4 grid gap-2 text-sm'>
                            <Row label={t?.itemsTotal ?? 'Items total'} value={apiFormatPrice(o.totalItemsPrice)} />
                            {!!o.deliveryCharges && o.deliveryCharges > 0 && (
                              <Row label={t?.deliveryCharges ?? 'Delivery charges'} value={apiFormatPrice(o.deliveryCharges)} />
                            )}

                            {o.isVoucherApplied && (o.discountAmount || 0) > 0 && (
                              <Row label={t?.discount ?? 'Discount'} value={`- ${apiFormatPrice(o.discountAmount)}`} valueClassName='text-green-700 font-semibold' />
                            )}

                            <Row label={`${t?.tax ?? 'Tax'} (${o.taxRate}%)`} value={apiFormatPrice(o.taxAmount)} />
                            <div className='border-t border-border my-1' />
                            <Row
                              label={t?.totalIncludingVAT ?? 'Total'}
                              value={apiFormatPrice(o.totalOrderPrice)}
                              labelClassName='font-bold'
                              valueClassName='font-bold text-foreground'
                            />
                          </div>

                          {/* Meta */}
                          <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <InfoCard title={t?.paymentMethod ?? 'Payment'}>
                              <div className='text-sm text-foreground'>
                                {o.paymentMethod === 'cash' ? t.cash : o.paymentMethod === 'ec-card reader' ? t.posCardPayment : o.paymentMethod}
                              </div>
                            </InfoCard>

                            <InfoCard title={t?.customer ?? 'Customer'}>
                              <div className='text-sm text-foreground'>{o.customerDetails?.name}</div>
                              {o.customerDetails?.phoneNumber && <div className='text-sm text-muted-foreground'>{o.customerDetails.phoneNumber}</div>}
                              {o.customerDetails?.email && <div className='text-sm text-muted-foreground'>{o.customerDetails.email}</div>}
                            </InfoCard>

                            {o.addressDetails?.address && (
                              <InfoCard title={t?.address ?? 'Address'}>
                                <div className='text-sm text-foreground'>{o.addressDetails.address}</div>
                                {o.addressDetails.postalCode && <div className='text-sm text-muted-foreground'>{o.addressDetails.postalCode}</div>}
                              </InfoCard>
                            )}

                            {!!o.vouchers?.length && (
                              <InfoCard title={t?.vouchers ?? 'Vouchers'}>
                                <div className='space-y-1'>
                                  {o.vouchers.map((v) => (
                                    <div key={v.id} className='text-sm text-foreground'>
                                      <span className='font-semibold'>{v.title || v.code || 'Voucher'}</span>
                                      {v.code ? <span className='text-muted-foreground'> — {v.code}</span> : null}
                                    </div>
                                  ))}
                                </div>
                              </InfoCard>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* FOOTER (same vibe as Cart footer) */}
        <div className='flex items-center justify-between border-t border-border bg-card px-6 py-4'>
          <div className='text-sm text-muted-foreground'>
            {userId ? (
              <span>
                {t?.totalOrders ?? 'Total orders'}: <span className='font-bold text-foreground'>{orders.length}</span>
              </span>
            ) : (
              <span>{t?.notLoggedIn ?? 'Not logged in'}</span>
            )}
          </div>

          <button onClick={() => handleOpenChange(false)} className='rounded-[12px] bg-surface-3 px-4 py-3 font-bold text-white transition hover:bg-elevated'>
            {t?.close ?? 'Close'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** ---- Small UI helpers ---- */
function Row({ label, value, labelClassName, valueClassName }: { label: string; value: string; labelClassName?: string; valueClassName?: string }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <div className={cn('text-foreground', labelClassName)}>{label}</div>
      <div className={cn('text-foreground', valueClassName)}>{value}</div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='rounded-lg border border-border bg-surface-3 p-3'>
      <div className='text-xs font-semibold text-muted-foreground'>{title}</div>
      <div className='mt-1'>{children}</div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className='h-[60vh] flex flex-col items-center justify-center text-center'>
      <div className='mb-3 text-muted-foreground'>{icon}</div>
      <div className='text-lg font-bold text-foreground'>{title}</div>
      <div className='mt-1 text-sm text-muted-foreground max-w-md'>{subtitle}</div>
    </div>
  );
}
