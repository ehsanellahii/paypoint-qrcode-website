  'use client';

  import { createContext, useContext, useState, useCallback, ReactNode, useEffect, startTransition } from 'react';
  import { Product } from './types';

  interface CartItemCustomization {
    [key: string]: string[];
  }

  export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    customizations: CartItemCustomization;
    notes?: string;
  }

  interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity: number, customizations: CartItemCustomization, notes?: string) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
  }

  const CartContext = createContext<CartContextType | undefined>(undefined);

  const CART_STORAGE_KEY = 'pos-cart';

  const getStoredCart = (): CartItem[] => {
    if (typeof window === 'undefined') {
      return [];
    }
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    
    return [];
  };

  const saveCart = (cart: CartItem[]): void => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
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
      if (isHydrated) {
        saveCart(cart);
      }
    }, [cart, isHydrated]);

    const addToCart = useCallback((product: Product, quantity: number, customizations: CartItemCustomization, notes?: string) => {
      const itemId = `${product.id}-${JSON.stringify(customizations)}`;
      
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === itemId);
        
        if (existingItem) {
          return prevCart.map(item =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        
        return [...prevCart, { id: itemId, product, quantity, customizations, notes }];
      });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
      setCart([]);
    }, []);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const totalPrice = cart.reduce((sum, item) => {
      const basePrice = item.product.price;
      
      let customizationPrice = 0;
      Object.keys(item.customizations).forEach(sectionId => {
        const section = item.product.sections.find(s => s.id === sectionId);
        if (section) {
          item.customizations[sectionId].forEach(itemId => {
            const sectionItem = section.items.find(i => i.id === itemId);
            if (sectionItem) {
              customizationPrice += sectionItem.price;
            }
          });
        }
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
