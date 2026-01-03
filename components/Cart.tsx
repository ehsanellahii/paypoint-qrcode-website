"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice as apiFormatPrice } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CheckoutForm from "./CheckoutForm";

interface CartProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Cart({
  isOpen: controlledIsOpen,
  onOpenChange,
}: CartProps = {}) {
  const { cart, updateQuantity, totalPrice } = useCart();
  const { t } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setIsOpen(false);
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setShowCheckout(false);
    }
  };

  return (
    <>
      {/* Cart Modal */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] flex flex-col p-0">
          {showCheckout ? (
            /* Checkout Form */
            <CheckoutForm
              onSuccess={handleCheckoutSuccess}
              onBack={handleBackToCart}
            />
          ) : (
            /* Cart Items */
            <>
              <DialogHeader className="p-6 pb-0 border-b-0">
                <DialogTitle className="text-3xl border-b py-8 border-gray-300 font-bold text-center">
                  {t.order}
                </DialogTitle>
              </DialogHeader>
              <div
                className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
                role="list"
                aria-label="Cart items"
              >
                {cart.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="bg-gray-100 rounded-lg p-4 flex items-center gap-3"
                      role="listitem"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.product.name}
                        </h3>

                        {/* Customizations */}
                        {Object.keys(item.customizations).length > 0 && (
                          <div className="mt-0.5 text-gray-600">
                            {Object.entries(item.customizations).map(
                              ([sectionId, itemIds]) => {
                                const section = item.product.sections.find(
                                  (s) => s.id === sectionId
                                );
                                if (!section) return null;
                                const selectedNames = itemIds
                                  .map((id) => {
                                    const sItem = section.items.find(
                                      (i) => i.id === id
                                    );
                                    return (
                                      sItem?.real_name || sItem?.name || ""
                                    );
                                  })
                                  .filter(Boolean);
                                return selectedNames.length > 0 ? (
                                  <div key={sectionId}>
                                    {selectedNames.map((name, idx) => (
                                      <p key={idx}>{name}</p>
                                    ))}
                                  </div>
                                ) : null;
                              }
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <p className="mt-0.5 text-xs text-gray-500 italic">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-10 h-10 rounded bg-[#ffc338] flex items-center justify-center font-bold text-black hover:bg-[#f0b72f] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="text-bold font-medium min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-10 h-10 rounded bg-[#ffc338] flex items-center justify-center font-bold text-black hover:bg-[#f0b72f] transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Footer */}
              <div className="border-t border-gray-300 px-6 py-4 space-y-3 bg-white">
                <div
                  className="flex items-center justify-between font-bold"
                  role="status"
                  aria-live="polite"
                >
                  <span>{t.totalIncludingVAT}</span>
                  <span aria-label={`Total: ${apiFormatPrice(totalPrice)}`}>
                    {apiFormatPrice(totalPrice)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="py-3 px-4 rounded bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors"
                  >
                    {t.close}
                  </button>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="py-3 px-4 rounded bg-[#ffc338] text-black font-medium hover:bg-[#f0b72f] transition-colors"
                    aria-label="Proceed to checkout"
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
