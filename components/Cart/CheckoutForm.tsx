/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '~/contexts/cart-context';
import { useLanguage } from '@/contexts/language-context';
import { formatCartItemsForOrder, getPostalRateInfo, storage } from '@/lib/utils';
import FormField from '@/components/FormField';
import { DialogHeader, DialogTitle } from '../ui/dialog';
import { IStoreInfo } from '~/lib/types';
import PaymentMethodForm from './PaymentMethodForm';
import { useAddress } from '~/contexts/address-context';
import TextareaField from '../TextAreaField';
import { generateTimeSlots } from '~/lib/generateTimeSlotsWithinHours';
import moment from 'moment-timezone';
import OrderSuccess from './OrderSuccess';
import { API_BASE_URL } from '~/lib/api';

const TZ = 'Europe/Berlin';

interface CheckoutFormProps {
  onSuccess: () => void;
  onBack?: () => void;
  storeInfo?: IStoreInfo;
  onStepChange?: (s: 'details' | 'payment' | 'success') => void;
}

interface CheckoutFormData {
  customerName: string;
  email: string;
  phoneNumber: string;
  deliveryNotes: string;
  pickupTime: string; // keep name to avoid more refactors (this is now "scheduledTime")
}

const STORAGE_KEY = 'persisted';

export default function CheckoutForm({ onSuccess, onBack, storeInfo, onStepChange }: CheckoutFormProps) {
  const { cart, totalPrice, clearCart, totalItems } = useCart();
  const { deliveryAddress, orderType } = useAddress();
  const { t } = useLanguage();

  // ---- orderType helpers (normalize if needed)
  const normalizedOrderType = orderType === 'dineIn' ? 'dine-in' : orderType; // if your app uses "dineIn"
  const isHaveTableInfo = !!storeInfo?.tableInfo?.token;
  const isDelivery = !isHaveTableInfo && normalizedOrderType === 'delivery';
  const isPickup = !isHaveTableInfo && normalizedOrderType === 'pickup';
  const isDineIn = isHaveTableInfo;

  const postalRateInfo = getPostalRateInfo(Number(deliveryAddress?.postalCode || 0), storeInfo?.postalRates || []);

  const deliveryAmount = postalRateInfo.deliveryCharges;

  // ✅ Fix: charge delivery fee ONLY for delivery
  const deliveryCharges = isDelivery ? deliveryAmount ?? 0 : 0;

  const deliveryTime = postalRateInfo?.deliveryTime || 0;

  const [orderId, setOrderId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    email: '',
    phoneNumber: '',
    deliveryNotes: '',
    pickupTime: 'asap', // now used as scheduled time for delivery/pickup
  });

  // Generic time slots (same list, label changes)
  // const generateTimeSlots = () => {
  //   const slots = [t.asapTime];
  //   const now = new Date();
  //   const startHour = now.getHours();
  //   const startMinute = now.getMinutes();

  //   let currentMinute = Math.ceil(startMinute / 15) * 15;
  //   let currentHour = startHour;

  //   if (currentMinute >= 60) {
  //     currentMinute = 0;
  //     currentHour += 1;
  //   }

  //   for (let i = 0; i < 16; i++) {
  //     const hour = currentHour + Math.floor((currentMinute + i * 15) / 60);
  //     const minute = (currentMinute + i * 15) % 60;

  //     if (hour < 23) {
  //       const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  //       slots.push(timeStr);
  //     }
  //   }

  //   return slots;
  // };

  // const timeSlots = generateTimeSlots();

  useEffect(() => {
    const savedInfo = storage.get<{
      customerName: string;
      email: string;
      phoneNumber: string;
      deliveryNotes: string;
    }>(STORAGE_KEY, {
      customerName: '',
      email: '',
      phoneNumber: '',
      deliveryNotes: '',
    });

    setFormData((prev) => ({
      ...prev,
      ...savedInfo,
    }));
  }, []);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  // Optional: if switching to dine-in, wipe these fields (prevents old values being sent)
  useEffect(() => {
    if (isDineIn) {
      setFormData((prev) => ({
        ...prev,
        deliveryNotes: '',
        pickupTime: 'asap',
      }));
    }
  }, [isDineIn]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (!formData.customerName.trim()) newErrors.customerName = t.nameRequired;

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t.phoneRequired;
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = t.invalidPhone;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) setStep('payment');
  };

  const handleSubmit = async (paymentMethod: string) => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = `${API_BASE_URL}/order`;

      const orderData: any = {
        adminId: storeInfo?.adminId || '',
        storeId: storeInfo?.storeId || '',
        orderType: isDineIn ? 'dineIn' : normalizedOrderType,
        paymentMethod: paymentMethod === 'card' ? 'ec-card reader' : 'cash',
        customerDetails: {
          name: formData.customerName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        },

        items: formatCartItemsForOrder(cart),

        totalOrderPrice: totalPrice + (deliveryCharges ?? 0),
        totalItems: totalItems,
        totalItemsPrice: totalPrice,
        deliveryCharges: deliveryCharges,
        deliveryTime: deliveryTime,
        orderSource: 'web',
        platform: 'WebShop',
      };
      if (orderData.orderType === 'delivery') {
        orderData.addressDetails = {
          street: deliveryAddress?.streetNumber || '',
          houseNumber: deliveryAddress?.route || '',
          postalCode: deliveryAddress?.postalCode || '',
          city: deliveryAddress?.locality || '',
          address: deliveryAddress?.formattedAddress || '',
          coordinates: {
            latitude: deliveryAddress?.lat || 0,
            longitude: deliveryAddress?.lng || 0,
          },
          deliveryNotes: formData.deliveryNotes,
        };
      }
      if (formData.pickupTime && formData.pickupTime !== 'asap') {
        // Create Berlin datetime for selected time (today)
        const todayBerlin = moment.tz(TZ).format('YYYY-MM-DD');

        let startBerlin = moment.tz(`${todayBerlin} ${formData.pickupTime}`, 'YYYY-MM-DD HH:mm', TZ);
        console.log('Initial startBerlin:', startBerlin.format());
        // IMPORTANT: handle overnight times (e.g. 01:30 when restaurant closes after midnight)
        // If your opening window is overnight and selected time is "after midnight",
        // you usually want next-day. Simple rule:
        // if selected time is earlier than "nowBerlin - 6 hours", push to next day.
        // (Or do it properly by returning dayOffset from generator; but this works decently.)
        const nowBerlin = moment.tz(TZ);
        if (startBerlin.isBefore(nowBerlin.clone().subtract(6, 'hours'))) {
          startBerlin = startBerlin.add(1, 'day');
        }

        // Duration: delivery => deliveryTime minutes, pickup => choose a default (15)
        const durationMins = isDelivery ? deliveryTime : 15;

        const endBerlin = startBerlin.clone().add(durationMins, 'minutes');

        orderData.deliverySchedule = {
          timezone: TZ,
          scheduledDate: startBerlin.toDate(), // Berlin date
          timeSlot: {
            startTime: startBerlin.format('HH:mm'), // ✅ UTC ISO
            endTime: endBerlin.format('HH:mm'), // ✅ UTC ISO (+deliveryTime)
          },
        };
      }
      if (isHaveTableInfo) {
        orderData.bookedTable = {
          area: storeInfo?.tableInfo?.areaName || '',
          table: storeInfo?.tableInfo?.tableNumber || 0,
          tableToken: storeInfo?.tableInfo?.token || '',
        };
      }
      orderData.isDiscounted = false;
      orderData.discountAmount = 0;
      orderData.isVoucherApplied = false;
      orderData.vouchers = [];
      console.log('Submitting order data:', orderData);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorRes = await response.json();
        console.error('Order submission error:', errorRes);
        throw new Error(errorRes.message || 'Failed to submit order');
      }

      const result = await response.json();

      storage.set(STORAGE_KEY, {
        customerName: formData.customerName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });
      console.log('Order submission result:', result);

      setStep('success');
      setOrderId(result?.data?.collectionCode);
      // onSuccess();
      console.log('Order submitted successfully:', result);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred while submitting your order.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ✅ Dynamic label for scheduled time
  const scheduledLabel = isDelivery ? t.deliveryTime ?? 'Delivery time' : t.pickupTime ?? 'Pickup time';

  // ✅ show/hide rules
  const showDeliveryNotes = isDelivery; // only delivery
  const showScheduledTime = !isDineIn && (isDelivery || isPickup);

  const timeSlots = generateTimeSlots({
    weeklyHours: storeInfo?.timings, // <-- put your dynamic weekly hours object here
    intervalMinutes: 15,
    maxSlots: 16,
    asapLabel: t.asapTime,
    minLeadMinutes: isDelivery ? deliveryTime + 60 : 60, // delivery: deliveryTime + 1 hour, pickup: 1 hour
  });

  return (
    <>
      {step != 'success' && (
        <DialogHeader className='p-6 pb-0 border-b-0'>
          <DialogTitle className='text-3xl border-b py-8 border-gray-300 font-bold text-center'>{step === 'details' ? t.enterDetails : t.paymentMethod}</DialogTitle>
        </DialogHeader>
      )}

      {step === 'success' ? (
        <OrderSuccess
          lastOrderId={orderId as string}
          onSuccess={() => {
            clearCart();
            onSuccess();
          }}
          step={step}
        />
      ) : step === 'payment' ? (
        <PaymentMethodForm
          onBack={() => setStep('details')}
          onSuccess={(paymentMethod) => handleSubmit(paymentMethod!)}
          deliveryCharges={deliveryCharges}
          isSubmitting={isSubmitting}
          storeInfo={storeInfo}
        />
      ) : (
        <div className='flex flex-col h-full'>
          <div className='flex-1 overflow-y-auto px-6 py-4'>
            <div className='bg-gray-100 rounded-lg p-6'>
              <h2 className='text-xl font-bold mb-6'>{t.yourData}</h2>

              <div className='space-y-4'>
                <FormField
                  id='customerName'
                  label={t.name}
                  type='text'
                  placeholder=''
                  value={formData.customerName}
                  onChange={(value) => handleInputChange('customerName', value)}
                  error={errors.customerName}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  id='email'
                  label={t.email}
                  type='email'
                  placeholder=''
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  error={errors.email}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  id='phoneNumber'
                  label={t.phoneNumber}
                  type='tel'
                  placeholder=''
                  value={formData.phoneNumber}
                  onChange={(value) => handleInputChange('phoneNumber', value)}
                  error={errors.phoneNumber}
                  required
                  disabled={isSubmitting}
                />

                {/* ✅ Delivery notes only for delivery */}
                {showDeliveryNotes && (
                  <TextareaField
                    id='deliveryNotes'
                    label={t.deliveryNotes}
                    placeholder={t.enterDeliveryNotes}
                    value={formData.deliveryNotes}
                    onChange={(value) => handleInputChange('deliveryNotes', value)}
                    disabled={isSubmitting}
                  />
                )}

                {/* ✅ Scheduled time for pickup/delivery only */}
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
                      disabled={isSubmitting}>
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

          <div className='border-t border-gray-300 px-6 py-4 space-y-3 bg-white'>
            <div className='grid grid-cols-2 gap-3'>
              <button type='button' onClick={onBack} className='py-3 px-4 rounded bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors'>
                {t.back}
              </button>
              <button type='button' onClick={handleNextStep} className='py-3 px-4 rounded bg-primary text-(--selected-text) font-medium transition-colors'>
                {t.next}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
