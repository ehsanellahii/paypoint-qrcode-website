'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCart } from '~/contexts/cart-context';
import { formatPrice } from '@/lib/api';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useScrollDetection, useSmoothScroll } from '@/hooks/useScrollDetection';
import { Dialog } from '@base-ui/react/dialog';
import { AddOnGroup, cn, getImageURL, MenuProduct } from '~/lib/utils';
import QuantityControl from '../QuantityControl';
import { useLanguage } from '~/contexts/language-context';

type CartItemCustomization = Record<string, Record<string, number>>; // sectionId -> { optionId -> qty }

interface ProductModalProps {
  product: MenuProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<CartItemCustomization>({});
  const [notes, setNotes] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const scroll = useScrollDetection({ current: containerElement }, 'vertical');
  const { scrollBy } = useSmoothScroll({ current: containerElement });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // callback ref
  const setScrollRef = (element: HTMLDivElement | null) => {
    scrollRef.current = element;
    setContainerElement(element);
  };

  // Reset modal state when opened
  useEffect(() => {
    if (!isOpen || !product) return;

    setQuantity(1);
    setNotes('');
    setSelectedOptions({});
    setErrors({});
  }, [isOpen, product]);

  // (Keep your existing scroll-check effect as-is if you want)
  useEffect(() => {
    if (!isOpen) return;

    const checkScroll = () => {
      const container = containerElement || scrollRef.current;
      if (!container) return;
      if (container.clientHeight === 0 || container.clientWidth === 0) return;
      container.dispatchEvent(new Event('scroll', { bubbles: true }));
    };

    const rafIds: number[] = [];
    const scheduleCheck = () => {
      const id1 = requestAnimationFrame(() => {
        checkScroll();
        const id2 = requestAnimationFrame(() => {
          checkScroll();
          const id3 = requestAnimationFrame(() => checkScroll());
          rafIds.push(id3);
        });
        rafIds.push(id2);
      });
      rafIds.push(id1);
    };

    scheduleCheck();

    return () => {
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, [isOpen, containerElement]);

  if (!product) return null;

  const getGroupTotal = (sectionId: string, map: CartItemCustomization) => {
    const group = map[sectionId] || {};
    return Object.values(group).reduce((a, b) => a + b, 0);
  };

  const getOptionQty = (sectionId: string, optionId: string) => selectedOptions?.[sectionId]?.[optionId] ?? 0;

  const setOptionQty = (section: AddOnGroup, optionId: string, nextQty: number) => {
    const sectionId = section._id;

    setSelectedOptions((prev) => {
      const currentGroup = prev[sectionId] || {};
      nextQty = Math.max(0, Math.floor(nextQty));

      // ✅ Single-choice (radio-like): if multiple selection is NOT allowed,
      // always replace the selection with the clicked option.
      if (!section.isMultipleSelectionAllowed) {
        // turning off (unselect)
        if (nextQty <= 0) {
          const { [sectionId]: _, ...rest } = prev;
          return rest;
        }

        // turning on (select) -> replace whatever was selected before
        return { ...prev, [sectionId]: { [optionId]: 1 } };
      }

      // ✅ Multi-qty mode (your existing logic)
      const currentQty = currentGroup[optionId] ?? 0;

      const groupTotal = Object.values(currentGroup).reduce((a, b) => a + b, 0);
      const delta = nextQty - currentQty;
      const nextTotal = groupTotal + delta;

      if (section.maximumQuantity > 0 && nextTotal > section.maximumQuantity) {
        return prev; // reject
      }

      const nextGroup: Record<string, number> = { ...currentGroup };
      if (nextQty === 0) delete nextGroup[optionId];
      else nextGroup[optionId] = nextQty;

      if (Object.keys(nextGroup).length === 0) {
        const { [sectionId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [sectionId]: nextGroup };
    });

    // clear error for that section (your existing part)
    setErrors((prev) => {
      if (!prev[sectionId]) return prev;
      const copy = { ...prev };
      delete copy[sectionId];
      return copy;
    });
  };

  const validateCustomizations = () => {
    const nextErrors: Record<string, string> = {};

    for (const section of product.addOns || []) {
      const total = getGroupTotal(section._id, selectedOptions);

      const min = section.minimumQuantity ?? 0;
      const max = section.maximumQuantity ?? 0;

      if (min > 0 && total < min) {
        nextErrors[section._id] = `${section.name}: choose at least ${min}`;
      } else if (max > 0 && total > max) {
        nextErrors[section._id] = `${section.name}: choose up to ${max}`;
      }
    }

    const firstInvalidSectionId = Object.keys(nextErrors)[0] || null;

    return { ok: firstInvalidSectionId === null, errors: nextErrors, firstInvalidSectionId };
  };

  const scrollContent = (direction: 'up' | 'down') => {
    scrollBy(direction === 'up' ? -200 : 200, 'vertical');
  };

  const calculateTotalPrice = () => {
    let total = product.currentPrice;

    (product.addOns || []).forEach((section) => {
      const group = selectedOptions[section._id] || {};
      Object.entries(group).forEach(([optionId, qty]) => {
        const opt = section.options.find((i) => i._id === optionId);
        if (opt && qty > 0) total += opt.price * qty;
      });
    });

    return total * quantity;
  };
  const scrollToSection = (sectionId: string) => {
    const container = containerElement || scrollRef.current;
    const el = sectionRefs.current[sectionId];
    if (!container || !el) return;

    // Scroll within the modal container (not window)
    const top = el.offsetTop - 24; // small padding
    container.scrollTo({ top, behavior: 'smooth' });
  };

  const handleAddToCart = () => {
    const v = validateCustomizations();

    if (!v.ok) {
      setErrors(v.errors);

      if (v.firstInvalidSectionId) {
        // make sure DOM has the red text before scrolling (nice UX)
        requestAnimationFrame(() => scrollToSection(v.firstInvalidSectionId!));
      }

      return;
    }

    setErrors({});
    addToCart(product, quantity, selectedOptions, notes);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className='fixed inset-0 z-60 bg-black/30 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0' />
        <Dialog.Viewport className='fixed inset-0 z-60 flex items-center justify-center p-4'>
          <Dialog.Popup className='max-w-5xl w-[calc(100vw-2rem)] h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] flex flex-col bg-white rounded-lg shadow-lg p-0 px-4 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95'>
            <Dialog.Title className='sr-only'>{product.name}</Dialog.Title>

            {/* Up Arrow */}
            {scroll.canScrollUp && (
              <button
                onClick={() => scrollContent('up')}
                className='absolute top-8 left-1/2 -translate-x-1/2 z-10 rounded-full p-2 shadow-lg mx-4'
                style={{ backgroundColor: 'var(--primary)' }}
                aria-label='Scroll up'>
                <ChevronUp className='h-5 w-5 text-(--selected-text)' />
              </button>
            )}

            {/* Scrollable Content */}
            <div ref={setScrollRef} className='grow overflow-y-scroll scrollbar-hide py-4 px-5'>
              {/* Product Image */}
              <div className='relative w-full max-w-md h-96 mx-auto overflow-hidden rounded-lg'>
                <Image
                  src={product.images?.length ? getImageURL(product.images[0]) : '/'}
                  alt={`${product.name} image`}
                  fill
                  className='object-contain'
                  sizes='(max-width: 768px) 100vw, 448px'
                />
              </div>

              {/* Product Details */}
              <div className='text-center mt-4'>
                <h1 className='font-semibold text-2xl'>{product.name}</h1>
                <div className='text-gray-500 text-xl'>{formatPrice(product.currentPrice)}</div>
                {product.description && <div className='py-4 text-gray-500'>{product.description}</div>}
              </div>

              {/* Sections (Customizations) */}
              <div className='flex flex-col items-stretch w-full'>
                {product.haveCustomizations && product.addOns?.length > 0 && (
                  <>
                    {product.addOns.map((section) => {
                      const groupTotal = getGroupTotal(section._id, selectedOptions);
                      const min = section.minimumQuantity ?? 0;
                      const max = section.maximumQuantity ?? 0;

                      return (
                        <div
                          key={section._id}
                          className='mt-4'
                          ref={(el) => {
                            sectionRefs.current[section._id] = el;
                          }}>
                          {/* Section Header */}
                          <div className='mb-4 flex flex-col items-center justify-center'>
                            <h2 className='font-semibold my-4 text-center text-lg mb-2'>{section.name}</h2>

                            {min > 0 && (!max || max === 0) && (
                              <span className={cn('text-gray-500 font-normal text-sm italic', errors[section._id] ? 'text-red-600' : 'text-gray-500')}>
                                {t.chooseMin} {min}
                              </span>
                            )}
                            {min > 0 && max > 0 && min != max && (
                              <span className={cn('text-gray-500 font-normal text-sm italic', errors[section._id] ? 'text-red-600' : 'text-gray-500')}>
                                {language === 'de' ? `Wähle min ${min} bis zu ${max}` : `Choose min ${min} up to ${max}`}
                              </span>
                            )}
                            {min === 0 && max > 0 && (
                              <span className='text-gray-500 font-normal text-sm italic'>
                                {t.chooseUpTo} {max}
                              </span>
                            )}
                            {min === max && min > 0 && (
                              <span className={cn('text-gray-500 font-normal text-sm italic', errors[section._id] ? 'text-red-600' : 'text-gray-500')}>
                                {language === 'de' ? `Wähle genau ${min}` : `Choose exactly ${min}`}
                              </span>
                            )}

                            {/* {max > 0 && (
                              <span className='text-gray-500 font-normal text-sm italic'>
                                {t.chooseUpTo} {max} ({t.selected} {groupTotal})
                              </span>
                            )} */}
                          </div>

                          {/* Options Grid */}
                          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                            {section.options.map((item) => {
                              const displayName = item.name || '';
                              const itemPrice = item.price;
                              const itemImage = ''; // if you add images later
                              const isAvailable = true;

                              const qty = getOptionQty(section._id, item._id);
                              const isSelected = qty > 0;

                              const maxReached = section.isMultipleSelectionAllowed && max > 0 && groupTotal >= max && qty === 0;

                              // allow increasing up to remaining capacity
                              const optionMax = max > 0 ? qty + (max - groupTotal) : (section.maxMultipleSelection ?? 99);

                              return (
                                <div
                                  key={item._id}
                                  className={cn(
                                    'rounded text-center border overflow-hidden select-none flex flex-col bg-gray-100 border-gray-200',
                                    isSelected && 'bg-primary border-primary text-(--selected-text)',
                                    !isAvailable && 'opacity-30'
                                  )}>
                                  {/* click-to-toggle for non-multi-qty mode */}
                                  {!section.isMultipleSelectionAllowed && (
                                    <button
                                      type='button'
                                      onClick={() => {
                                        if (!isAvailable) return;
                                        if (maxReached) return;
                                        setOptionQty(section, item._id, isSelected ? 0 : 1);
                                      }}
                                      className='w-full grow'>
                                      {itemImage && (
                                        <div className='relative w-full h-48'>
                                          <Image src={itemImage} alt={`${displayName} image`} fill className='object-contain' sizes='(max-width: 768px) 50vw, 200px' />
                                        </div>
                                      )}

                                      <div className='py-4 px-2 flex flex-col items-center justify-center'>
                                        <span className='font-semibold'>{displayName}</span>
                                        <div className='text-gray-500 text-center'>{!isAvailable ? 'Out of stock' : itemPrice > 0 ? formatPrice(itemPrice) : ''}</div>
                                      </div>
                                    </button>
                                  )}

                                  {/* multi-qty mode */}
                                  {section.isMultipleSelectionAllowed && (
                                    <>
                                      <div className='py-4 px-2 grow flex flex-col items-center justify-center'>
                                        <span className='font-semibold'>{displayName}</span>
                                        <div className='text-gray-500 text-center'>{!isAvailable ? 'Out of stock' : itemPrice > 0 ? formatPrice(itemPrice) : ''}</div>
                                      </div>

                                      <div className='flex items-center justify-center py-3'>
                                        <QuantityControl
                                          value={qty}
                                          onChange={(val) => {
                                            if (!isAvailable) return;
                                            if (val > qty && max > 0 && groupTotal >= max) return;
                                            setOptionQty(section, item._id, val);
                                          }}
                                          min={0}
                                          max={optionMax}
                                          size='md'
                                          variant='compact'
                                        />
                                      </div>

                                      {maxReached && <div className='pb-3 text-xs text-gray-600'>{t.maxReached}</div>}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              {/* Notes (optional) */}
              <div className='mt-6'>
                <h2 className='font-semibold mt-6 mb-2 text-lg'>{t.specialInstructions}</h2>
                <textarea className='w-full h-20 p-2 border rounded focus:border-none' value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            {/* Down Arrow */}
            {scroll.canScrollDown && (
              <button
                onClick={() => scrollContent('down')}
                className='absolute bottom-24 left-1/2 -translate-x-1/2 z-10 rounded-full p-2 shadow-lg mx-4'
                style={{ backgroundColor: 'var(--primary)' }}
                aria-label='Scroll down'>
                <ChevronDown className='h-5 w-5 text-[--selected-text]' />
              </button>
            )}

            {/* Footer */}
            <div className='shrink-0 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 px-5 pb-4'>
              <Dialog.Close className='bg-gray-200 py-2 px-3 rounded' type='button'>
                {t.close}
              </Dialog.Close>

              <button onClick={handleAddToCart} className='bg-primary text-[--selected-text] py-2 px-3 rounded font-medium' type='button'>
                {t.add} ({formatPrice(calculateTotalPrice())})
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
