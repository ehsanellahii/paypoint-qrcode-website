'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  startTransition,
} from 'react';
import { MenuProduct } from './utils';

/**
 * Add-on quantities:
 * sectionId -> { optionId -> qty }
 */
export type CartItemCustomization = Record<string, Record<string, number>>;

export interface CartItem {
  id: string;
  product: MenuProduct;
  quantity: number;
  customizations: CartItemCustomization;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: MenuProduct,
    quantity: number,
    customizations: CartItemCustomization,
    notes?: string
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pos-cart2';

const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

const saveCart = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

/**
 * Deterministic stringify so the same customizations always create the same item id.
 * Sort sectionIds and optionIds.
 */
const stableStringifyCustomizations = (c: CartItemCustomization) => {
  const sectionIds = Object.keys(c || {}).sort();
  const normalized: Record<string, Record<string, number>> = {};

  for (const sid of sectionIds) {
    const group = c[sid] || {};
    const optionIds = Object.keys(group).sort();
    normalized[sid] = {};
    for (const oid of optionIds) {
      const qty = Number(group[oid] ?? 0);
      if (qty > 0) normalized[sid][oid] = qty; // keep only positive
    }
    // remove empty groups
    if (Object.keys(normalized[sid]).length === 0) {
      delete normalized[sid];
    }
  }

  return JSON.stringify(normalized);
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedCart = getStoredCart();
    startTransition(() => {
      setCart(storedCart);
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (isHydrated) saveCart(cart);
  }, [cart, isHydrated]);

  const addToCart = useCallback(
    (
      product: MenuProduct,
      quantity: number,
      customizations: CartItemCustomization,
      notes?: string
    ) => {
      const safeQty = Math.max(1, Math.floor(quantity || 1));

      const normalizedKey = stableStringifyCustomizations(customizations || {});
      const itemId = `${product.id}-${normalizedKey}`;

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === itemId);

        if (existingItem) {
          return prevCart.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + safeQty }
              : item
          );
        }

        return [
          ...prevCart,
          {
            id: itemId,
            product,
            quantity: safeQty,
            customizations: customizations || {},
            notes,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      const safeQty = Math.floor(quantity || 0);
      if (safeQty <= 0) {
        removeFromCart(itemId);
        return;
      }
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: safeQty } : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce((sum, item) => {
    const basePrice = item.product.currentPrice;

    let customizationPrice = 0;

    Object.entries(item.customizations || {}).forEach(([sectionId, group]) => {
      const section = item.product.addOns?.find((s) => s._id === sectionId);
      if (!section) return;

      Object.entries(group || {}).forEach(([optionId, qty]) => {
        const q = Number(qty ?? 0);
        if (q <= 0) return;

        const sectionItem = section.options?.find((i) => i._id === optionId);
        if (!sectionItem) return;

        customizationPrice += sectionItem.price * q;
      });
    });

    return sum + (basePrice + customizationPrice) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
