/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import { useLanguage } from '~/lib/language-context';

const OrderSuccess = ({ lastOrderId, onSuccess, step }: { lastOrderId: string; onSuccess: () => void; step: 'success' | 'details' | 'payment' }) => {
  const { t } = useLanguage();
  const [successCountdown, setSuccessCountdown] = useState(5);
  useEffect(() => {
    if (step !== 'success') return;

    setSuccessCountdown(5);

    const interval = setInterval(() => {
      setSuccessCountdown((s) => s - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      onSuccess(); // close modal / navigate (whatever you already do)
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [step, onSuccess]);

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 px-6 py-10 flex flex-col items-center justify-center text-center'>
        <div className=' p-8 w-full'>
          <h2 className='text-2xl font-bold mb-2'>{t.orderPlacedSuccessfully ?? 'Order placed successfully 🎉'}</h2>

          {lastOrderId && (
            <p className='text-sm text-gray-600 mb-4'>
              {t.orderId ?? 'Order ID'}: <span className='font-semibold'>{lastOrderId}</span>
            </p>
          )}

          <p className='text-gray-700 mb-6'>
            {t.redirectingIn ?? 'Redirecting in'} <span className='font-semibold'>{successCountdown}</span>s...
          </p>

          <button type='button' onClick={onSuccess} className='py-3 px-4 rounded bg-[#ffc338] text-black font-medium hover:bg-[#f0b72f] transition-colors w-full'>
            {t.continue ?? 'Continue now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
