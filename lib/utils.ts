import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IStoreInfo } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
      return false;
    }
  },
};

export const isDeliveryAvailableForPostalCode = (postalCode: number, postalRates: IStoreInfo['postalRates']): boolean => {
  if (!postalRates || postalRates.length === 0) return false;
  return postalRates.some((rate) => rate.postalCode === postalCode);
};

export const getDeliveryChargesFromPostalCode = (postalCode: number, postalRates: IStoreInfo['postalRates']) => {
  console.log('Getting delivery charges for postal code:', postalCode);
  console.log('Available postal rates:', postalRates);
  if (!postalRates || postalRates.length === 0) return null;
  const rate = postalRates.find((rate) => rate.postalCode === postalCode);
  return rate ? rate.deliveryCharges : null;
};

// ✅ Generic helpers
export type MongoId = string;

export type DiscountType = 'percentage' | 'fixed';
export type SelectionType = 'single' | 'multiple';

// ------------------------------
// Root: Category / Menu Section
// ------------------------------
export interface MenuCategory {
  id: MongoId; // you have id at category level
  name: string;
  productsCount: number;
  sortId: number;
  image: string; // filename/path
  products: MenuProduct[];
}

// ------------------------------
// Product
// ------------------------------
export interface MenuProduct {
  _id: MongoId; // you have both _id and id
  id: MongoId;
  name: string;
  description?: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  discountType?: DiscountType;
  images: string[];
  haveCustomizations: boolean;
  addOns: AddOnGroup[];
}

// ------------------------------
// Add-on group (Customization group)
// ------------------------------
export interface AddOnGroup {
  _id: MongoId;
  name: string;

  // quantity rules
  minimumQuantity?: number;
  maximumQuantity: number;

  // selection rules
  isMultipleSelectionAllowed: boolean;
  maxMultipleSelection?: number;

  options: AddOnOption[];
}

// ------------------------------
// Option inside add-on group
// ------------------------------
export interface AddOnOption {
  _id: MongoId;
  name: string;
  price: number;
}

export interface IMenuData {
  data: MenuCategory[];
  success: boolean;
}

export const getImageURL = (imageKey: string): string => {
  if (!imageKey) return '';
  return 'https://paypoint-web-storage.s3.eu-central-1.amazonaws.com/menu/' + imageKey;
};
