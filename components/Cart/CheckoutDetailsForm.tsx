'use client';

import { useEffect, useState } from 'react';
import FormField from '@/components/FormField';
import TextareaField from '../TextAreaField';
import { cn, storage } from '~/lib/utils';
import { API_BASE_URL, X_API_KEY, formatPrice } from '~/lib/api';
import { Loader2, Bell, Zap, Check, Clock } from 'lucide-react';
import { useUser } from '~/contexts/user-context';
import { useAddress } from '~/contexts/address-context';

export interface CheckoutFormData {
  customerName: string;
  email: string;
  phoneNumber: string;
  deliveryNotes: string;
  pickupTime: string;
  bellName: string;
  deliverySpeed: 'standard' | 'priority';
}

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  isSubmitting: boolean;
  isDelivery?: boolean;
  /** Priority delivery is only offered when the postal rate defines a charge. */
  priorityAvailable?: boolean;
  priorityCharge?: number;
  priorityTime?: number;
  standardTime?: number;
  /** Set when a pre-order slot was chosen on the menu. */
  preorderLabel?: string;
  showDeliveryNotes: boolean;
  showScheduledTime: boolean;
  scheduledLabel: string;
  timeSlots: string[];
  isDineIn?: boolean;
  initialData?: Partial<CheckoutFormData>;
  onBack?: () => void;
  onValidNext: (data: CheckoutFormData) => void;
};

const STORAGE_KEY = 'persisted';

export default function CheckoutDetailsForm({
  t,
  isSubmitting,
  isDelivery = false,
  priorityAvailable = false,
  priorityCharge = 0,
  priorityTime = 0,
  standardTime = 0,
  preorderLabel,
  showDeliveryNotes,
  showScheduledTime,
  scheduledLabel,
  timeSlots,
  onBack,
  onValidNext,
  isDineIn = false,
}: Props) {
  const { setUser } = useUser();
  const { orderType, deliveryAddress } = useAddress();
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    email: '',
    phoneNumber: '',
    deliveryNotes: '',
    pickupTime: 'asap',
    bellName: '',
    deliverySpeed: 'standard',
  });

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const savedInfo = storage.get<Partial<CheckoutFormData>>(STORAGE_KEY, {
      customerName: '',
      email: '',
      phoneNumber: '',
      deliveryNotes: '',
      pickupTime: 'asap',
    });
    if (isDineIn) {
      savedInfo.deliveryNotes = '';
      savedInfo.pickupTime = 'asap';
    }
    setFormData((prev) => ({ ...prev, ...savedInfo }));
  }, [isDineIn]);

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (loginError) setLoginError(undefined);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    if (!formData.customerName.trim()) newErrors.customerName = t.nameRequired;
    if (!formData.email.trim()) newErrors.email = t.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.invalidEmail;
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = t.phoneRequired;
    else if (!/^[\d\s+\-()]+$/.test(formData.phoneNumber)) newErrors.phoneNumber = t.invalidPhone;
    if (isDelivery && !formData.bellName.trim()) newErrors.bellName = t.bellNameRequired ?? t.nameRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginBeforeNext = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      name: formData.customerName.trim(),
      signInWith: 'phone',
      signInSource: 'web',
    };
    if (orderType === 'delivery' && deliveryAddress) {
      payload.address = deliveryAddress.formattedAddress;
      payload.coordinates = { latitude: deliveryAddress.lat, longitude: deliveryAddress.lng };
      payload.postalCode = deliveryAddress.postalCode;
      payload.street = deliveryAddress.streetNumber;
      payload.houseNumber = deliveryAddress.route;
      payload.city = deliveryAddress.locality;
      payload.country = deliveryAddress.country;
    }
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': X_API_KEY },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = json?.message || t.loginFailed || 'Login failed';
      setLoginError(msg);
      throw new Error(msg);
    }
    const user = json?.data;
    if (!user?.email && !user?.userId && !user?.uid) throw new Error('Login succeeded but response did not look like a user object.');
    setUser(user);
    return user;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    setIsLoggingIn(true);
    try {
      await loginBeforeNext();
      onValidNext(formData);
    } catch (e) {
      console.error('Login before next failed:', e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const disabled = isSubmitting || isLoggingIn;

  const speedCard = (key: 'standard' | 'priority', title: string, sub: string, priceLabel: string) => {
    const active = formData.deliverySpeed === key;
    return (
      <button
        type='button'
        onClick={() => setFormData((p) => ({ ...p, deliverySpeed: key }))}
        className={cn('flex items-center gap-3.5 rounded-[14px] border-2 p-4 text-left transition', active ? 'border-white bg-surface-3' : 'border-border bg-surface-1')}>
        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-white bg-white' : 'border-[#55575c]')}>
          {active && <Check className='h-[13px] w-[13px] text-black' strokeWidth={2.8} />}
        </span>
        <span className='flex-1'>
          <span className='flex items-center gap-1.5 text-[14.5px] font-extrabold'>
            {title}
            {key === 'priority' && <Zap className='h-3.5 w-3.5 fill-white' />}
          </span>
          <span className='mt-0.5 block text-[12.5px] font-medium text-muted-foreground'>{sub}</span>
        </span>
        <span className='text-[13px] font-bold text-muted-foreground'>{priceLabel}</span>
      </button>
    );
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto scrollbar-hide px-6 py-4'>
        <div className='rounded-[16px] bg-surface-1 p-6'>
          <h2 className='mb-6 text-xl font-extrabold'>{t.yourData}</h2>
          <div className='space-y-4'>
            <FormField id='customerName' label={t.name} type='text' value={formData.customerName} onChange={(v) => handleInputChange('customerName', v)} error={errors.customerName} required disabled={disabled} />
            <FormField id='email' label={t.email} type='email' value={formData.email} onChange={(v) => handleInputChange('email', v)} error={errors.email} required disabled={disabled} />
            <FormField id='phoneNumber' label={t.phoneNumber} type='tel' value={formData.phoneNumber} onChange={(v) => handleInputChange('phoneNumber', v)} error={errors.phoneNumber} required disabled={disabled} />

            {isDelivery && (
              <FormField id='bellName' label={t.bellName ?? 'Bell name'} type='text' value={formData.bellName} onChange={(v) => handleInputChange('bellName', v)} error={errors.bellName} required disabled={disabled} />
            )}

            {showDeliveryNotes && (
              <TextareaField id='deliveryNotes' label={t.deliveryNotes} placeholder={t.enterDeliveryNotes} value={formData.deliveryNotes} onChange={(v) => handleInputChange('deliveryNotes', v)} disabled={disabled} />
            )}
          </div>
        </div>

        {/* Delivery speed — only offered when the store defines a priority charge */}
        {isDelivery && priorityAvailable && (
          <div className='mt-4'>
            <div className='mb-2.5 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.04em] text-white'>
              <Bell className='h-3.5 w-3.5' /> {t.deliverySpeedLabel ?? 'Delivery time'}
            </div>
            <div className='flex flex-col gap-2.5'>
              {speedCard('standard', t.standard ?? 'Standard', standardTime ? `${standardTime} Min` : '', t.free ?? 'Free')}
              {speedCard('priority', t.priority ?? 'Priority', priorityTime ? `${priorityTime} Min` : '', `+ ${formatPrice(priorityCharge)}`)}
            </div>
          </div>
        )}

        {/* Pre-order slot chosen on the menu */}
        {preorderLabel && (
          <div className='mt-4 flex items-center gap-3 rounded-[14px] border border-border bg-surface-1 px-4 py-3.5'>
            <Clock className='h-5 w-5 shrink-0 text-muted-foreground' />
            <div className='min-w-0 flex-1'>
              <div className='text-[12.5px] font-bold uppercase tracking-[0.04em] text-muted-foreground'>{t.preorder ?? 'Pre-order'}</div>
              <div className='mt-0.5 text-[14.5px] font-extrabold'>{preorderLabel}</div>
            </div>
          </div>
        )}

        {/* Scheduled time */}
        {showScheduledTime && (
          <div className='mt-4'>
            <label htmlFor='pickupTime' className='mb-2 block text-[12.5px] font-bold uppercase tracking-[0.04em] text-white'>
              {scheduledLabel}
            </label>
            <select
              id='pickupTime'
              value={formData.pickupTime}
              onChange={(e) => handleInputChange('pickupTime', e.target.value)}
              className='h-12 w-full rounded-[14px] border border-border bg-surface-1 px-4 text-white outline-none transition-colors focus:border-white/60'
              disabled={disabled}>
              {timeSlots.map((slot, index) => (
                <option key={index} value={index === 0 ? 'asap' : slot} className='bg-card'>
                  {index === 0 ? t.asapTime : slot}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loginError && <div className='px-6 pb-4 font-medium text-brand-red'>{loginError}</div>}

      <div className='border-t border-border px-6 py-4'>
        <div className='grid grid-cols-2 gap-3'>
          <button type='button' onClick={onBack} className='rounded-[14px] bg-surface-3 px-4 py-3.5 font-bold text-white transition hover:bg-elevated disabled:opacity-50' disabled={disabled || !onBack}>
            {t.back}
          </button>
          <button
            type='button'
            onClick={handleNext}
            className='flex items-center justify-center rounded-[14px] bg-primary px-4 py-3.5 font-extrabold text-selected-text transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
            disabled={disabled}>
            {isLoggingIn ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t.loading ?? 'Loading...'}
              </>
            ) : (
              t.next
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
