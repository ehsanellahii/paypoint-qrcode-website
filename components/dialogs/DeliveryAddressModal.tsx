/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { cn } from '~/lib/utils';
import { useGoogleMaps } from '~/hooks/useGoogleMaps';
import { useLanguage } from '~/contexts/language-context';

type AddressParts = {
  formattedAddress: string;
  placeId: string;
  lat: number;
  lng: number;

  streetNumber?: string;
  route?: string;
  postalCode?: string;
  locality?: string; // city
  adminArea?: string; // state/region
  country?: string;

  // Useful for backend
  raw?: google.maps.places.PlaceResult;
};

type DeliveryAddressModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (address: AddressParts) => void;
  googleApiKey: string;
  onSuccess?: () => void;
};

function parseAddress(place: google.maps.places.PlaceResult): AddressParts {
  const comps = place.address_components ?? [];
  const get = (type: string) => comps.find((c) => c.types.includes(type))?.long_name;

  const lat = place.geometry?.location?.lat?.() ?? 0;
  const lng = place.geometry?.location?.lng?.() ?? 0;

  return {
    formattedAddress: place.formatted_address ?? place.name ?? '',
    placeId: place.place_id ?? '',
    lat,
    lng,
    streetNumber: get('street_number'),
    route: get('route'),
    postalCode: get('postal_code'),
    locality: get('locality') ?? get('postal_town'),
    adminArea: get('administrative_area_level_1'),
    country: get('country'),
    raw: place,
  };
}

function validateAddress(a: AddressParts, t: any) {
  const missing: string[] = [];
  if (!a.streetNumber) missing.push(t.houseStreetNumber);
  if (!a.route) missing.push(t.streetName);
  if (!a.postalCode) missing.push(t.postalCode);
  return {
    ok: missing.length === 0,
    message: missing.length === 0 ? '' : `${t.pleaseSelectCompleteAddress} ${missing.join(', ')}.`,
  };
}

export default function DeliveryAddressModal({ open, onClose, onSelect, googleApiKey, onSuccess }: DeliveryAddressModalProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingError, setTypingError] = useState<string>('');
  const [selectionError, setSelectionError] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const { loaded, error } = useGoogleMaps(googleApiKey);
  const canUseGoogle = loaded;

  // Reset when opened
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setPredictions([]);
    setTypingError('');
    setSelectionError('');
    setActiveIndex(-1);

    // focus input
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Debounced autocomplete
  useEffect(() => {
    if (!open || !loaded) return;

    if (!canUseGoogle) {
      setTypingError(t.googleMapNotLoadedError);
      return;
    }

    const q = query.trim();
    setSelectionError('');

    if (q.length === 0) {
      setPredictions([]);
      setTypingError('');
      return;
    }

    // Lightweight typing hint (while user types)
    // (Real validation happens on selection via place details)
    if (q.length < 6) {
      setTypingError(t.typeMoreDetailsError);
    } else {
      setTypingError('');
    }

    const svc = new google.maps.places.AutocompleteService();

    const handle = window.setTimeout(() => {
      setLoading(true);
      svc.getPlacePredictions(
        {
          input: q,
          // optional: restrict country, eg:
          // componentRestrictions: { country: 'nl' },
          types: ['address'],
        },
        (res, status) => {
          setLoading(false);
          if (status !== google.maps.places.PlacesServiceStatus.OK || !res) {
            setPredictions([]);
            return;
          }
          setPredictions(res);
        }
      );
    }, 250);

    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, loaded, open, canUseGoogle]);

  const fetchPlaceDetails = (placeId: string) => {
    if (!canUseGoogle) return;

    setLoading(true);
    setSelectionError('');

    // PlacesService requires a DOM node
    const dummy = document.createElement('div');
    const service = new google.maps.places.PlacesService(dummy);

    service.getDetails(
      {
        placeId,
        fields: ['place_id', 'formatted_address', 'address_components', 'geometry', 'name'],
      },
      (place, status) => {
        setLoading(false);
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          setSelectionError(t.couldNotFetchAddressDetails);
          return;
        }

        const parsed = parseAddress(place);
        const v = validateAddress(parsed, t);

        if (!v.ok) {
          setSelectionError(v.message);
          return;
        }

        onSelect(parsed);
        if (onSuccess) onSuccess();
        onClose();
      }
    );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (predictions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        fetchPlaceDetails(predictions[activeIndex].place_id);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  if (error) {
    return (
      <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
        {/* same ProductModal styling */}
        <Dialog.Portal>
          <Dialog.Backdrop className='fixed inset-0 z-50 bg-black/30' />
          <Dialog.Viewport className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <Dialog.Popup className='max-w-2xl w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg px-4'>
              <div className='py-6 px-5 text-center'>
                <div className='font-semibold text-lg'>{t.deliveryAddress}</div>
                <div className='mt-2 text-sm text-red-600'>{error}</div>
              </div>
              <div className='border-t border-gray-200 px-5 pb-4 pt-4'>
                <button onClick={onClose} className='w-full bg-gray-200 py-2 px-3 rounded' type='button'>
                  {t.close}
                </button>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  if (!loaded) {
    return (
      <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
        <Dialog.Portal>
          <Dialog.Backdrop className='fixed inset-0 z-50 bg-black/30' />
          <Dialog.Viewport className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <Dialog.Popup className='max-w-2xl w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg px-4'>
              <div className='py-8 px-5 text-center'>
                <div className='font-semibold text-lg'>{t.loadingMaps}…</div>
                <div className='mt-2 text-sm text-gray-500'>{t.pleaseWait}</div>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className='fixed inset-0 z-50 bg-black/30 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0' />
        <Dialog.Viewport className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <Dialog.Popup className='max-w-2xl w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] flex flex-col bg-white rounded-lg shadow-lg p-0 px-4 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95'>
            <Dialog.Title className='sr-only'>{t.deliveryAddress}</Dialog.Title>

            {/* Header */}
            <div className='shrink-0 pt-5 px-5'>
              <h2 className='text-xl font-semibold text-center'>{t.deliveryAddress}</h2>
              <p className='text-gray-500 text-sm text-center mt-1'>{t.startTypeAndChooseAddress}</p>
            </div>

            {/* Body */}
            <div className='grow overflow-y-auto scrollbar-hide py-4 px-5'>
              {/* Input */}
              <div className='mt-2'>
                <label className='sr-only' htmlFor='delivery-address'>
                  {t.deliveryAddress}
                </label>
                <input
                  ref={inputRef}
                  id='delivery-address'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={t.addressSearchPlaceholder}
                  className={cn(
                    'w-full rounded-lg border px-4 py-3 text-base outline-none focus:no-ring focus:border-none',
                    'border-gray-200 focus:border-[#ffc338] focus:ring-0 focus:ring-[#ffc338]/30'
                  )}
                />

                {/* Typing helper / Loading */}
                <div className='min-h-5.5 mt-2 text-sm'>
                  {loading ? <span className='text-gray-500'>{t.searching}…</span> : typingError ? <span className='text-gray-500'>{typingError}</span> : null}
                </div>

                {/* Selection error */}
                {selectionError && <div className='mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{selectionError}</div>}
              </div>

              {/* Suggestions */}
              {predictions.length > 0 && (
                <div className='mt-3 rounded-lg border border-gray-200 overflow-hidden'>
                  {predictions.map((p, idx) => (
                    <button
                      key={p.place_id}
                      type='button'
                      onClick={() => fetchPlaceDetails(p.place_id)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0',
                        'hover:bg-gray-50 transition',
                        idx === activeIndex && 'bg-gray-50'
                      )}>
                      <div className='font-medium text-gray-900'>{p.structured_formatting?.main_text ?? p.description}</div>
                      <div className='text-sm text-gray-500'>{p.structured_formatting?.secondary_text ?? ''}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && query.trim().length > 0 && predictions.length === 0 && <div className='mt-3 text-sm text-gray-500'>{t.noSuggestionsFoundAddPostalCode}</div>}
            </div>

            {/* Footer */}
            <div className='shrink-0 grid grid-cols-1 gap-4 pt-4 border-t border-gray-200 px-5 pb-4'>
              <Dialog.Close className='bg-gray-200 py-2 px-3 rounded' type='button'>
                {t.close}
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
