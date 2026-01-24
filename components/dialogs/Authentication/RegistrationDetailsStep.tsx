'use client';

import React from 'react';
import FormField from '~/components/FormField';
import PhoneNumberField from '~/components/PhoneField';
import type { RegistrationFormValues } from './auth.schema';
import { Loader2 } from 'lucide-react';

type FieldErrors = Partial<Record<keyof RegistrationFormValues, string>>;

type Props = {
  t: any;
  loading: boolean;

  values: RegistrationFormValues;
  errors: FieldErrors;

  onChange: <K extends keyof RegistrationFormValues>(key: K, value: RegistrationFormValues[K]) => void;

  onClose: () => void;
  onSendOtp: () => void;
};

export default function RegistrationDetailsStep({ t, loading, values, errors, onChange, onClose, onSendOtp }: Props) {
  return (
    <>
      <div className='flex-1 overflow-y-auto flex flex-col gap-y-3 px-4 py-6'>
        <FormField
          id='customerName'
          label={t.name}
          type='text'
          value={values.customerName}
          onChange={(v) => onChange('customerName', v)}
          error={errors.customerName}
          required
          disabled={loading}
        />

        <PhoneNumberField
          id='phoneNumber'
          label={t.phoneNumber}
          codeValue={values.phoneCode}
          numberValue={values.phoneNumber}
          onChangeCode={(v) => onChange('phoneCode', v)}
          onChangeNumber={(v) => onChange('phoneNumber', v)}
          error={errors.phoneNumber || errors.phoneCode}
          required
          disabled={loading}
          helperText={t?.phoneHelper ?? 'Include your mobile number without leading 0'}
        />
      </div>

      <div className='border-t border-gray-300 px-6 py-4 bg-white flex items-center justify-between gap-2'>
        <button onClick={onClose} className='py-3 px-4 rounded bg-gray-200 font-medium' disabled={loading}>
          {t?.close ?? 'Close'}
        </button>

        <button onClick={onSendOtp} className='py-3 px-4 rounded bg-black text-white font-medium disabled:opacity-60 flex justify-center items-center' disabled={loading}>
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {t?.sendOtp ?? 'Send OTP'}
            </>
          ) : (
            <>{t?.sendOtp ?? 'Send OTP'}</>
          )}
        </button>
      </div>
    </>
  );
}
