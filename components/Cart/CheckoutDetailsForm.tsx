'use client';

import { useEffect, useState } from 'react';
import FormField from '@/components/FormField';
import TextareaField from '../TextAreaField';
import { storage } from '~/lib/utils';
import { API_BASE_URL, X_API_KEY } from '~/lib/api'; // ✅ add this
import { Loader2 } from 'lucide-react';
import { useUser } from '~/contexts/user-context';
import { useAddress } from '~/contexts/address-context';

export interface CheckoutFormData {
  customerName: string;
  email: string;
  phoneNumber: string;
  deliveryNotes: string;
  pickupTime: string;
}

type Props = {
  t: any;
  isSubmitting: boolean;

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
  });

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const savedInfo = storage.get<{
      customerName: string;
      email: string;
      phoneNumber: string;
      deliveryNotes: string;
      pickupTime?: string;
    }>(STORAGE_KEY, {
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

    setFormData((prev) => ({
      ...prev,
      ...savedInfo,
    }));
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
    else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phoneNumber)) newErrors.phoneNumber = t.invalidPhone;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ NEW: login mutation
  const loginBeforeNext = async () => {
    const payload: any = {
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      name: formData.customerName.trim(),
      signInWith: 'phone',
      signInSource: 'web',
    };
    if (orderType === 'delivery' && deliveryAddress) {
      payload.address = deliveryAddress.formattedAddress;
      payload.coordinates = {
        latitude: deliveryAddress.lat,
        longitude: deliveryAddress.lng,
      };
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

    // if backend sometimes returns {message: "..."} on error:
    const json = await res.json();

    if (!res.ok) {
      const msg = json?.message || t.loginFailed || 'Login failed';
      setLoginError(msg);
      throw new Error(msg);
    }

    // ✅ success: response is the user object
    const user = json?.data;

    // (optional sanity check)
    if (!user?.email && !user?.userId && !user?.uid) {
      throw new Error('Login succeeded but response did not look like a user object.');
    }

    setUser(user);
    return user;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setIsLoggingIn(true);
    try {
      await loginBeforeNext(); // ✅ must succeed
      onValidNext(formData); // ✅ go to payment step
    } catch (e) {
      // optional: if you want an alert too
      // alert(e instanceof Error ? e.message : 'Login failed');
      console.error('Login before next failed:', e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const disabled = isSubmitting || isLoggingIn;

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto px-6 py-4'>
        <div className='bg-gray-100 rounded-lg p-6'>
          <h2 className='text-xl font-bold mb-6'>{t.yourData}</h2>

          <div className='space-y-4'>
            <FormField
              id='customerName'
              label={t.name}
              type='text'
              value={formData.customerName}
              onChange={(v) => handleInputChange('customerName', v)}
              error={errors.customerName}
              required
              disabled={disabled}
            />

            <FormField
              id='email'
              label={t.email}
              type='email'
              value={formData.email}
              onChange={(v) => handleInputChange('email', v)}
              error={errors.email}
              required
              disabled={disabled}
            />

            <FormField
              id='phoneNumber'
              label={t.phoneNumber}
              type='tel'
              value={formData.phoneNumber}
              onChange={(v) => handleInputChange('phoneNumber', v)}
              error={errors.phoneNumber}
              required
              disabled={disabled}
            />

            {showDeliveryNotes && (
              <TextareaField
                id='deliveryNotes'
                label={t.deliveryNotes}
                placeholder={t.enterDeliveryNotes}
                value={formData.deliveryNotes}
                onChange={(v) => handleInputChange('deliveryNotes', v)}
                disabled={disabled}
              />
            )}

            {showScheduledTime && (
              <div>
                <label htmlFor='pickupTime' className='block font-semibold mb-2'>
                  {scheduledLabel}
                </label>
                <select
                  id='pickupTime'
                  value={formData.pickupTime}
                  onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                  className='w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white focus:border-primary focus:outline-none transition-colors'
                  disabled={disabled}>
                  {timeSlots.map((slot, index) => (
                    <option key={index} value={index === 0 ? 'asap' : slot}>
                      {index === 0 ? t.asapTime : slot}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
      {loginError && <div className='px-6 pb-4 text-red-600 font-medium'>{loginError}</div>}
      <div className='border-t border-gray-300 px-6 py-4'>
        <div className='grid grid-cols-2 gap-3'>
          <button
            type='button'
            onClick={onBack}
            className='py-3 px-4 rounded bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors'
            disabled={disabled || !onBack}>
            {t.back}
          </button>

          <button
            type='button'
            onClick={handleNext}
            className='py-3 px-4 rounded bg-primary text-(--selected-text) font-medium hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
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
