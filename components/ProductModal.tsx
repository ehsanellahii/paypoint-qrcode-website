"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Product, Section } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/api";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useScrollDetection, useSmoothScroll } from "@/hooks/useScrollDetection";
import { Dialog } from "@base-ui/react/dialog";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{
    [sectionId: string]: string[];
  }>({});
  const [notes, setNotes] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const scroll = useScrollDetection({ current: containerElement }, 'vertical');
  const { scrollBy } = useSmoothScroll({ current: containerElement });
  
  // Use callback ref to detect when container is mounted
  const setScrollRef = (element: HTMLDivElement | null) => {
    scrollRef.current = element;
    console.log('[ProductModal] Scroll ref callback', { hasElement: !!element, isOpen });
    setContainerElement(element);
  };
  
  // Debug: Log scroll state changes
  useEffect(() => {
    console.log('[ProductModal] Scroll state updated', scroll);
  }, [scroll]);

  useEffect(() => {
    if (!isOpen || !product) return;

    // Reset state when dialog opens - this is intentional
    const defaults: { [sectionId: string]: string[] } = {};
    product.sections.forEach((section) => {
      const defaultItems = section.items
        .filter(item => item.default_selected)
        .map(item => item.id);
      if (defaultItems.length > 0 || section.min_quantity > 0) {
        defaults[section.id] = defaultItems;
      }
    });
    
    // Batch state updates - resetting modal state on open is a valid pattern
    setQuantity(1);
    setNotes("");
    setSelectedOptions(defaults);
  }, [isOpen, product]);

  // Trigger scroll detection check when dialog opens and content is rendered
  useEffect(() => {
    console.log('[ProductModal] Scroll check effect triggered', { isOpen, hasProduct: !!product });
    if (!isOpen) {
      console.log('[ProductModal] Dialog not open, returning');
      return;
    }
    
    const checkScroll = () => {
      const container = containerElement || scrollRef.current;
      console.log('[ProductModal] checkScroll called', { 
        hasContainer: !!container,
        containerHeight: container?.clientHeight,
        containerWidth: container?.clientWidth,
        scrollHeight: container?.scrollHeight,
        scrollTop: container?.scrollTop
      });
      
      if (!container) {
        console.log('[ProductModal] No container in checkScroll');
        return;
      }
      
      // Ensure container has dimensions before checking
      if (container.clientHeight === 0 || container.clientWidth === 0) {
        console.log('[ProductModal] Container has no dimensions, skipping');
        return;
      }
      
      console.log('[ProductModal] Dispatching scroll event to trigger re-check');
      // Trigger scroll event to force re-check
      container.dispatchEvent(new Event('scroll', { bubbles: true }));
    };
    
    // Multiple checks with increasing delays to catch all layout phases
    const rafIds: number[] = [];
    
    const scheduleCheck = () => {
      console.log('[ProductModal] scheduleCheck called');
      const id1 = requestAnimationFrame(() => {
        console.log('[ProductModal] RAF 1 - First scheduled check');
        checkScroll();
        const id2 = requestAnimationFrame(() => {
          console.log('[ProductModal] RAF 2 - Second scheduled check');
          checkScroll();
          const id3 = requestAnimationFrame(() => {
            console.log('[ProductModal] RAF 3 - Third scheduled check');
            checkScroll();
            const id4 = requestAnimationFrame(() => {
              console.log('[ProductModal] RAF 4 - Fourth scheduled check');
              checkScroll();
            });
            rafIds.push(id4);
          });
          rafIds.push(id3);
        });
        rafIds.push(id2);
      });
      rafIds.push(id1);
    };
    
    console.log('[ProductModal] Starting scheduled checks');
    scheduleCheck();
    
    // Check when all images are loaded (they affect scroll height)
    const checkImages = () => {
      console.log('[ProductModal] checkImages called');
      const container = containerElement || scrollRef.current;
      if (!container) {
        console.log('[ProductModal] No container in checkImages');
        return;
      }
      
      const images = container.querySelectorAll('img');
      let loadedCount = 0;
      const totalImages = images.length;
      
      console.log('[ProductModal] Image check', { totalImages });
      
      if (totalImages === 0) {
        console.log('[ProductModal] No images found, checking scroll after frame');
        // No images, check scroll after a frame
        const id1 = requestAnimationFrame(() => {
          const id2 = requestAnimationFrame(() => {
            console.log('[ProductModal] No images - triggering checkScroll');
            checkScroll();
          });
          rafIds.push(id2);
        });
        rafIds.push(id1);
        return;
      }
      
      const handleImageLoad = () => {
        loadedCount++;
        console.log('[ProductModal] Image loaded', { loadedCount, totalImages });
        if (loadedCount === totalImages) {
          console.log('[ProductModal] All images loaded, checking scroll');
          // All images loaded, check scroll multiple times
          const id1 = requestAnimationFrame(() => {
            const id2 = requestAnimationFrame(() => {
              checkScroll();
              const id3 = requestAnimationFrame(checkScroll);
              rafIds.push(id3);
            });
            rafIds.push(id2);
          });
          rafIds.push(id1);
        }
      };
      
      images.forEach((img, index) => {
        if (img.complete) {
          console.log(`[ProductModal] Image ${index} already complete`);
          loadedCount++;
          if (loadedCount === totalImages) {
            console.log('[ProductModal] All images already complete, checking scroll');
            const id1 = requestAnimationFrame(() => {
              const id2 = requestAnimationFrame(() => {
                checkScroll();
                const id3 = requestAnimationFrame(checkScroll);
                rafIds.push(id3);
              });
              rafIds.push(id2);
            });
            rafIds.push(id1);
          }
        } else {
          console.log(`[ProductModal] Image ${index} not complete, adding listeners`);
          img.addEventListener('load', handleImageLoad, { once: true });
          img.addEventListener('error', handleImageLoad, { once: true });
        }
      });
      
      return () => {
        images.forEach(img => {
          img.removeEventListener('load', handleImageLoad);
          img.removeEventListener('error', handleImageLoad);
        });
      };
    };
    
    // Wait a bit for DOM to be ready, then check images
    console.log('[ProductModal] Scheduling image check');
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        console.log('[ProductModal] Running checkImages');
        checkImages();
      });
      rafIds.push(id2);
    });
    rafIds.push(id1);
    
    return () => {
      rafIds.forEach(id => cancelAnimationFrame(id));
    };
  }, [isOpen, product, containerElement]);

  if (!product) return null;

  const handleOptionToggle = (sectionId: string, itemId: string, section: Section) => {
    setSelectedOptions((prev) => {
      const current = prev[sectionId] || [];
      const isSelected = current.includes(itemId);

      if (section.type === 'addons' && section.max_quantity === 1) {
        // Radio behavior - single selection
        return { ...prev, [sectionId]: [itemId] };
      } else {
        // Checkbox behavior - multiple selection
        if (isSelected) {
          return { ...prev, [sectionId]: current.filter(id => id !== itemId) };
        } else {
          // Check max constraint
          if (section.max_quantity > 0 && current.length >= section.max_quantity) {
            return prev;
          }
          return { ...prev, [sectionId]: [...current, itemId] };
        }
      }
    });
  };

  const scrollContent = (direction: 'up' | 'down') => {
    const amount = direction === 'up' ? -200 : 200;
    scrollBy(amount, 'vertical');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOptions, notes);
    onClose();
  };

  const calculateTotalPrice = () => {
    let total = product.price;
    
    product.sections.forEach(section => {
      const selected = selectedOptions[section.id] || [];
      selected.forEach(itemId => {
        const item = section.items.find(i => i.id === itemId);
        if (item) {
          total += item.price;
        }
      });
    });
    
    return total * quantity;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="max-w-5xl w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-lg shadow-lg p-0 px-4 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95">
            <Dialog.Title className="sr-only">{product.name}</Dialog.Title>

            {/* Up Arrow */}
            {(() => {
              console.log('[ProductModal] Render check - scroll state', scroll);
              return scroll.canScrollUp;
            })() && (
              <button
                onClick={() => scrollContent('up')}
                className="absolute top-8 left-1/2 -translate-x-1/2 z-10 rounded-full p-2 shadow-lg mx-4"
                style={{ backgroundColor: "#ffc338" }}
                aria-label="Scroll up"
              >
                <ChevronUp className="h-5 w-5 text-gray-700" />
              </button>
            )}

            {/* Scrollable Content */}
            <div ref={setScrollRef} className="grow overflow-y-scroll scrollbar-hide py-4 px-5">
          {/* Product Image */}
          <div className="relative w-full max-w-md h-96 mx-auto overflow-hidden rounded-lg">
            <Image
              src={product.image}
              alt={`${product.name} image`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          </div>

          {/* Product Details */}
          <div className="text-center mt-4">
            <h1 className="font-semibold text-2xl">{product.name}</h1>
            <div className="text-gray-500 text-xl">{formatPrice(product.price)}</div>
            {product.description && (
              <div className="py-4 text-gray-500">{product.description}</div>
            )}
          </div>

          {/* Sections (Customizations) */}
          <div className="flex flex-col items-stretch w-full">
            {product.sections && product.sections.length > 0 && (
              <>
                {product.sections.map((section) => (
                  <div key={section.id} className="mt-4">
                    {/* Section Header */}
                    <div className="mb-4 flex flex-col items-center justify-center">
                      <h2 className="font-semibold my-4 text-center text-lg mb-2">
                        {section.name}
                      </h2>
                      {!section.optional && section.min_quantity > 0 && (
                        <span className="text-gray-500 font-normal text-sm italic">
                          Required - Choose at least {section.min_quantity}
                        </span>
                      )}
                      {section.optional && section.max_quantity > 0 && (
                        <span className="text-gray-500 font-normal text-sm italic">
                          Optional - Choose up to {section.max_quantity}
                        </span>
                      )}
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {section.items.map((item) => {
                        const displayName = item.real_name || item.name || 
                          (item.product?.name) || (item.addon?.name) || '';
                        const itemPrice = item.price;
                        const itemImage = item.product?.image || item.addon?.image || '';
                        const isAvailable = item.in_stock;
                        
                        const selected = selectedOptions[section.id] || [];
                        const isSelected = selected.includes(item.id);

                        const currentCount = selected.length;
                        const isMaxReached = section.max_quantity > 0 && 
                          currentCount >= section.max_quantity && !isSelected;

                        return (
                          <button
                            key={item.id}
                            onClick={() =>
                              !isMaxReached &&
                              isAvailable &&
                              handleOptionToggle(section.id, item.id, section)
                            }
                            disabled={isMaxReached || !isAvailable}
                            className={`
                              rounded cursor-pointer text-center border overflow-hidden select-none flex flex-col
                              ${
                                isSelected
                                  ? "bg-[#ffc338] border-[#ffc338]"
                                  : "bg-gray-100 border-gray-200"
                              }
                              ${!isAvailable ? "opacity-30" : ""}
                              ${
                                isMaxReached && isAvailable
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            `}
                          >
                            {/* Option Image */}
                            {itemImage && (
                              <div className="relative w-full h-48">
                                <Image
                                  src={itemImage}
                                  alt={`${displayName} image`}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 768px) 50vw, 200px"
                                />
                              </div>
                            )}

                            {/* Option Details */}
                            <div className="py-4 px-2 grow flex flex-col items-center justify-center">
                              <span className="font-semibold">
                                {displayName}
                              </span>
                              <div className="text-gray-500 text-center">
                                {!isAvailable
                                  ? "Out of stock"
                                  : itemPrice > 0
                                  ? formatPrice(itemPrice)
                                  : ""}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

            {/* Down Arrow */}
            {(() => {
              console.log('[ProductModal] Render check - scroll.canScrollDown', scroll.canScrollDown);
              return scroll.canScrollDown;
            })() && (
              <button
                onClick={() => scrollContent('down')}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 rounded-full p-2 shadow-lg mx-4"
                style={{ backgroundColor: "#ffc338" }}
                aria-label="Scroll down"
              >
                <ChevronDown className="h-5 w-5 text-gray-700" />
              </button>
            )}

            {/* Footer with buttons */}
            <div className="shrink-0 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 px-5 pb-4">
              <Dialog.Close
                className="bg-gray-200 py-2 px-3 rounded"
                type="button"
              >
                Close
              </Dialog.Close>
              <button
                onClick={handleAddToCart}
                className="bg-[#ffc338] py-2 px-3 rounded font-medium"
                type="button"
              >
                Add ({formatPrice(calculateTotalPrice())})
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
