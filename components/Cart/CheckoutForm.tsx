'use client';

import { useState, useEffect } from 'react';
import { useCart } from '~/contexts/cart-context';
import { useLanguage } from '@/contexts/language-context';
import { formatCartItemsForOrder, getPostalRateInfo, storage } from '@/lib/utils';
import { DialogHeader, DialogTitle } from '../ui/dialog';
import PaymentMethodForm from './PaymentMethodForm';
import { useAddress } from '~/contexts/address-context';
import { generateTimeSlots } from '~/lib/generateTimeSlotsWithinHours';
import moment from 'moment-timezone';
import OrderSuccess from './OrderSuccess';
import { API_BASE_URL } from '~/lib/api';
import CheckoutDetailsForm from './CheckoutDetailsForm';
import { useUser } from '~/contexts/user-context';
import { useStore } from '~/contexts/store-context';

const TZ = 'Europe/Berlin';

interface CheckoutFormProps {
  onSuccess: () => void;
  onBack?: () => void;
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

export default function CheckoutForm({ onSuccess, onBack, onStepChange }: CheckoutFormProps) {
  const storeInfo = useStore();
  const { user } = useUser();
  const { cart, totalPrice, clearCart, totalItems, discountAmount, appliedVoucher } = useCart();
  const { deliveryAddress, orderType } = useAddress();
  const { t } = useLanguage();

  const normalizedOrderType = orderType === 'dineIn' ? 'dine-in' : orderType;
  const isHaveTableInfo = !!storeInfo?.tableInfo?.token;
  const isDelivery = !isHaveTableInfo && normalizedOrderType === 'delivery';
  const isPickup = !isHaveTableInfo && normalizedOrderType === 'pickup';
  const isDineIn = isHaveTableInfo;

  const postalRateInfo = getPostalRateInfo(Number(deliveryAddress?.postalCode || 0), storeInfo?.postalRates || []);
  const deliveryAmount = postalRateInfo.deliveryCharges;
  const deliveryCharges = isDelivery ? (deliveryAmount ?? 0) : 0;
  const deliveryTime = postalRateInfo?.deliveryTime || 0;
  const minimumOrderAmount = postalRateInfo?.minimumOrderAmount || 0;
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    email: '',
    phoneNumber: '',
    deliveryNotes: '',
    pickupTime: 'asap', // now used as scheduled time for delivery/pickup
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const handleSubmit = async (paymentMethod: string) => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    if (isDelivery && deliveryCharges === null) {
      alert('Delivery is not available for the provided postal code.');
      return;
    }
    if (isDelivery && totalPrice < minimumOrderAmount) {
      alert(`The minimum order amount for delivery is ${minimumOrderAmount.toFixed(2)}.`);
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

        totalOrderPrice: totalPrice - discountAmount + (deliveryCharges ?? 0),
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
      if (user?._id) {
        orderData.customerId = user._id;
      }
      orderData.isDiscounted = discountAmount > 0;
      orderData.discountAmount = discountAmount;
      orderData.isVoucherApplied = appliedVoucher != null;
      if (appliedVoucher) {
        orderData.vouchers = [
          {
            id: appliedVoucher.voucherId,
            voucherId: appliedVoucher.voucherId,
            title: appliedVoucher.title,
            code: appliedVoucher.code,
            discountType: appliedVoucher.discountType,
            discountValue: appliedVoucher.discountValue,
          },
        ];
      }
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

      console.log('Order submitted successfully:', result);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred while submitting your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduledLabel = isDelivery ? (t.deliveryTime ?? 'Delivery time') : (t.pickupTime ?? 'Pickup time');
  const showDeliveryNotes = isDelivery;
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
        />
      ) : (
        <CheckoutDetailsForm
          t={t}
          isSubmitting={isSubmitting}
          showDeliveryNotes={showDeliveryNotes}
          showScheduledTime={showScheduledTime}
          scheduledLabel={scheduledLabel}
          timeSlots={timeSlots}
          onBack={onBack}
          onValidNext={(data) => {
            setFormData(data);
            setStep('payment');
          }}
        />
      )}
    </>
  );
}
