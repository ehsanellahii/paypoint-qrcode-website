'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '~/lib/utils';

type PhoneCodeOption = {
  iso2: string;
  label: string;
  dialCode: string; // e.g. "+49"
};

const DEFAULT_PHONE_CODES: PhoneCodeOption[] = [
  { iso2: 'de', label: 'Germany', dialCode: '+49' },
  { iso2: 'pk', label: 'Pakistan', dialCode: '+92' },
  { iso2: 'us', label: 'United States', dialCode: '+1' },
  { iso2: 'gb', label: 'United Kingdom', dialCode: '+44' },
  { iso2: 'fr', label: 'France', dialCode: '+33' },
  { iso2: 'it', label: 'Italy', dialCode: '+39' },
  { iso2: 'es', label: 'Spain', dialCode: '+34' },
];

type Props = {
  id: string;
  label: string;
  codeValue: string; // "+49"
  numberValue: string; // "1512345678"
  onChangeCode: (v: string) => void;
  onChangeNumber: (v: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  options?: PhoneCodeOption[];
  placeholder?: string;
};

export default function PhoneNumberField({
  id,
  label,
  codeValue,
  numberValue,
  onChangeCode,
  onChangeNumber,
  error,
  required = false,
  disabled = false,
  helperText,
  options = DEFAULT_PHONE_CODES,
  placeholder = 'e.g. 1512345678',
}: Props) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </Label>

      <div className='flex items-center'>
        <div className=''>
          <Select value={codeValue} onValueChange={onChangeCode} disabled={disabled}>
            <SelectTrigger className={cn('border-r-none rounded-r-none ', error ? 'border-red-500' : '')}>
              <SelectValue placeholder='+49' className='' />
            </SelectTrigger>
            <SelectContent className=''>
              {options.map((o) => (
                <SelectItem key={o.iso2} value={o.dialCode}>
                  {o.dialCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input
          id={id}
          type='tel'
          inputMode='tel'
          placeholder={placeholder}
          value={numberValue}
          onChange={(e) => {
            // keep only digits/spaces; adjust if you want to allow "-" etc.
            const cleaned = e.target.value.replace(/[^\d\s]/g, '');
            onChangeNumber(cleaned);
          }}
          className={cn(
            'focus:outline-0 focus:ring-0 shadow-none  border-l-0 rounded-l-none h-9.5! focus-visible:outline-none  focus-visible:ring-0 focus-visible:outline-offset-0! focus-visible:outline-0! focus-visible:border-gray-200! focus:border-gray-200!',
            error ? 'border-red-500' : ''
          )}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          autoComplete='off'
        />
      </div>

      {error && (
        <p id={`${id}-error`} className='text-sm text-red-500' role='alert'>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} className='text-xs text-gray-500'>
          {helperText}
        </p>
      )}
    </div>
  );
}
