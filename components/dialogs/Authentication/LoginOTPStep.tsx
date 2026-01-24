'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';
import OtpInput from 'react-otp-input';

type Props = {
  t: any;
  disabled: boolean;

  phoneLabel: string;

  otp: string;
  otpError?: string;

  otpLength?: number;

  onChangeOtp: (value: string) => void;
  onBack: () => void;
  onResend: () => void;
  onVerify: () => void;
};

export default function LoginOtpStep({ t, disabled, phoneLabel, otp, otpError, otpLength = 6, onChangeOtp, onBack, onResend, onVerify }: Props) {
  return (
    <>
      <div className='flex-1 overflow-y-auto flex flex-col gap-y-4 px-4 py-6'>
        <div className='text-sm text-gray-600'>
          {t?.otpSentTo ?? 'We sent an OTP to'} <span className='font-medium text-gray-900'>{phoneLabel}</span>
        </div>

        <div className='flex justify-center'>
          <OtpInput
            value={otp}
            onChange={onChangeOtp}
            numInputs={otpLength}
            // isInputNum
            shouldAutoFocus
            inputType='tel'
            renderSeparator={<span className='w-2' />}
            containerStyle='flex justify-center gap-2'
            inputStyle={{
              width: '44px',
              height: '48px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              fontSize: '18px',
              textAlign: 'center',
              outline: 'none',
            }}
            renderInput={(props) => <input {...props} />}
          />
        </div>

        {!!otpError && <p className='text-sm text-red-500 text-center'>{otpError}</p>}

        <button type='button' onClick={onResend} disabled={disabled} className='text-sm underline text-gray-700 disabled:opacity-60 self-center'>
          {t.resendOtp}
        </button>
      </div>

      <div className='border-t border-gray-300 px-6 py-4 bg-white flex items-center justify-between gap-2'>
        <button onClick={onBack} className='py-3 px-4 rounded bg-gray-200 font-medium' disabled={disabled}>
          {t.back}
        </button>

        <button
          onClick={onVerify}
          className='py-3 px-4 rounded bg-primary text-(--selected-text) font-medium disabled:opacity-60 flex justify-center items-center'
          disabled={disabled}>
          {disabled ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {t.verify}
            </>
          ) : (
            <> {t.verify}</>
          )}
        </button>
      </div>
    </>
  );
}
