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
import type { PreorderSlot } from '~/components/menu/PreorderModal';

const TZ = 'Europe/Berlin';

interface CheckoutFormProps {
  onSuccess: () => void;
  onBack?: () => void;
  onStepChange?: (s: 'details' | 'payment' | 'success') => void;
  /** Free-text note for the restaurant, captured in the cart. */
  orderMessage?: string;
  /** Pre-order slot chosen on the menu (day + time), if any. */
  scheduledSlot?: PreorderSlot | null;
}

interface CheckoutFormData {
  customerName: string;
  email: string;
  phoneNumber: string;
  deliveryNotes: string;
  pickupTime: string; // keep name to avoid more refactors (this is now "scheduledTime")
  bellName: string;
  deliverySpeed: 'standard' | 'priority';
}

const STORAGE_KEY = 'persisted';

export default function CheckoutForm({ onSuccess, onBack, onStepChange, orderMessage, scheduledSlot = null }: CheckoutFormProps) {
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
    bellName: '',
    deliverySpeed: 'standard',
  });
  const [tip, setTip] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ paymentName: string; total: number; etaLo: number; etaHi: number; etaLabel?: string } | null>(null);

  // Priority surcharge comes from the store's postal rate (the server re-resolves
  // and re-validates this value; the client figure is display-only).
  const priorityDeliveryCharge = postalRateInfo?.priorityDeliveryCharges ?? 0;
  const priorityDeliveryTime = postalRateInfo?.priorityDeliveryTime ?? 0;
  const priorityAvailable = isDelivery && priorityDeliveryCharge > 0;
  const priorityFee = priorityAvailable && formData.deliverySpeed === 'priority' ? priorityDeliveryCharge : 0;

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

        totalOrderPrice: totalPrice - discountAmount + (deliveryCharges ?? 0) + priorityFee + tip,
        totalItems: totalItems,
        totalItemsPrice: totalPrice,
        deliveryCharges: deliveryCharges,
        deliveryTime: deliveryTime,
        tip: tip,
        deliverySpeed: isDelivery ? formData.deliverySpeed : undefined,
        priorityFee: priorityFee,
        // Free-text note for the restaurant (maps to Order.instructions)
        instructions: (orderMessage || '').trim(),
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
          bellName: formData.bellName,
        };
      }
      // Shown on the confirmation screen when the order is scheduled.
      let scheduledEtaLabel: string | undefined;

      // A pre-order slot chosen on the menu wins over the same-day time select.
      const effectiveSlot: { dayOffset: number; time: string } | null = scheduledSlot
        ? { dayOffset: scheduledSlot.dayOffset, time: scheduledSlot.time }
        : formData.pickupTime && formData.pickupTime !== 'asap'
          ? { dayOffset: 0, time: formData.pickupTime }
          : null;

      if (effectiveSlot) {
        const dayBerlin = moment
          .tz(TZ)
          .add(effectiveSlot.dayOffset, 'days')
          .format('YYYY-MM-DD');

        let startBerlin = moment.tz(`${dayBerlin} ${effectiveSlot.time}`, 'YYYY-MM-DD HH:mm', TZ);

        // Only for same-day selections: handle overnight windows (e.g. 01:30 when
        // the restaurant closes after midnight) by pushing to the next day.
        // Future-dated pre-orders already carry an explicit day, so leave them alone.
        if (effectiveSlot.dayOffset === 0) {
          const nowBerlin = moment.tz(TZ);
          if (startBerlin.isBefore(nowBerlin.clone().subtract(6, 'hours'))) {
            startBerlin = startBerlin.add(1, 'day');
          }
        }

        // Duration: delivery => deliveryTime minutes, pickup => default 15
        const durationMins = isDelivery ? deliveryTime : 15;
        const endBerlin = startBerlin.clone().add(durationMins, 'minutes');

        orderData.deliverySchedule = {
          timezone: TZ,
          scheduledDate: startBerlin.toDate(),
          timeSlot: {
            startTime: startBerlin.format('HH:mm'),
            endTime: endBerlin.format('HH:mm'),
          },
        };

        scheduledEtaLabel = `${startBerlin.format('HH:mm')} – ${endBerlin.format('HH:mm')}`;
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

      const etaLo = isDelivery ? (formData.deliverySpeed === 'priority' ? 20 : 30) : 5;
      const etaHi = isDelivery ? (formData.deliverySpeed === 'priority' ? 30 : 40) : 15;
      setPlaced({
        paymentName: paymentMethod === 'card' ? t.posCardPayment : t.cash,
        total: totalPrice - discountAmount + (deliveryCharges ?? 0) + priorityFee + tip,
        etaLo,
        etaHi,
        etaLabel: scheduledEtaLabel,
      });
      setStep('success');
      setOrderId(result?.data?.collectionCode);

    } catch (error) {
      console.error('Error submitting order:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred while submitting your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduledLabel = isDelivery ? (t.deliveryTime ?? 'Delivery time') : (t.pickupTime ?? 'Pickup time');
  const showDeliveryNotes = isDelivery;
  // When a pre-order slot is already chosen on the menu, the same-day time
  // select is redundant — we show the chosen slot instead.
  const showScheduledTime = !isDineIn && (isDelivery || isPickup) && !scheduledSlot;
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
        <DialogHeader className='border-b-0 p-6 pb-0'>
          <DialogTitle className='border-b border-border py-8 text-center font-display text-3xl font-extrabold'>{step === 'details' ? t.enterDetails : t.paymentMethod}</DialogTitle>
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
          isDelivery={isDelivery}
          paymentName={placed?.paymentName}
          total={placed?.total}
          etaLo={placed?.etaLo}
          etaHi={placed?.etaHi}
          etaLabel={placed?.etaLabel}
        />
      ) : step === 'payment' ? (
        <PaymentMethodForm
          onBack={() => setStep('details')}
          onSuccess={(paymentMethod) => handleSubmit(paymentMethod!)}
          deliveryCharges={deliveryCharges}
          priorityFee={priorityFee}
          tip={tip}
          onTipChange={setTip}
          isSubmitting={isSubmitting}
        />
      ) : (
        <CheckoutDetailsForm
          t={t}
          isSubmitting={isSubmitting}
          isDelivery={isDelivery}
          priorityAvailable={priorityAvailable}
          priorityCharge={priorityDeliveryCharge}
          priorityTime={priorityDeliveryTime}
          standardTime={deliveryTime}
          showDeliveryNotes={showDeliveryNotes}
          preorderLabel={scheduledSlot?.label}
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
