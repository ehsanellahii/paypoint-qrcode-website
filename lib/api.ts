import { cache } from 'react';
import { getImageURL, IMenuData, MenuCategory, MenuProduct } from './utils';

export const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://api.paypointpos.de/integration' : 'http://localhost:4000/integration';
export const X_API_KEY = 'b3db8d621de8b0b9ab5351d05779f400:92b2cbc1e4bdcb0ab019ea16ae31d3fea304508e734672a5cf6661cded997f0c';
// export const API_BASE_URL = 'http://localhost:4000/integration';
const API_HEADERS: {
  'accept': string;
  'content-type': string;
  'x-paypoint-tenant-id'?: string;
  'x-paypoint-store-id'?: string;
  'x-api-key': string;
} = {
  'accept': 'application/json',
  'content-type': 'application/json',
  'x-api-key': X_API_KEY,
};

export const getStoreData = cache(async (slug: string, token?: string) => {
  console.log('Fetching store data for slug:', slug, 'with token:', token);
  const tokenParam = token ? `?token=${token}` : '';
  const response = await fetch(`${API_BASE_URL}/slugs/${slug}${tokenParam}`, {
    headers: API_HEADERS,
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch store data');
  }
  const data = await response.json();
  console.log('API Store Data:', data?.data);
  return {
    brandName: data?.data?.brandName,
    storeName: data?.data?.store_name,
    address: data?.data?.address,
    street: data?.data?.street,
    houseNumber: data?.data?.houseNumber,
    postalCode: data?.data?.postalCode,
    city: data?.data?.place,
    phone: data?.data?.phone,
    email: data?.data?.emailAddress,
    logo: data?.data?.logoFileName ? `${getImageURL(data?.data?.logoFileName)}` : null,
    timings: data?.data?.timings || null,
    settings: data?.data?.webShopSettings
      ? {
          ...data?.data?.webShopSettings,
          logo: data?.data?.webShopSettings?.logo ? `${getImageURL(data?.data?.webShopSettings?.logo)}` : null,
        }
      : null,
    adminGoogleApiKey: data?.data?.adminGoogleApiKey || '',
    posGoogleApiKey: data?.data?.posGoogleApiKey || '',
    postalRates: data?.data?.postalRates || [],
    storeId: data?.data?._id || '',
    adminId: data?.data?.adminId || '',
    tableInfo: {
      token: data?.data?.tableInfo?.token || '',
      areaId: data?.data?.tableInfo?.areaId || '',
      areaName: data?.data?.tableInfo?.areaName || '',
      tableId: data?.data?.tableInfo?.tableId || 0,
      tableNumber: data?.data?.tableInfo?.tableNumber || 0,
    },
  };
});

export const fetchMenuData = async (adminId?: string, storeId?: string) => {
  if (!adminId || !storeId) {
    throw new Error('Admin ID and Store ID are required to fetch menu data.');
  }
  const API_URL = `${API_BASE_URL}/menu`;
  API_HEADERS['x-paypoint-tenant-id'] = adminId;
  API_HEADERS['x-paypoint-store-id'] = storeId;

  try {
    const response = await fetch(API_URL, {
      headers: API_HEADERS,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      // get the message from the response body
      const errorData = await response.json();
      console.error('Error response data:', errorData);
      throw new Error(errorData.message ?? `Failed to fetch menu data: ${response.status}`);
    }

    const data: IMenuData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching menu data:', error);
    throw error;
  }
};

// Utility functions to process menu data

export function getCategories(siteData: IMenuData): MenuCategory[] {
  return siteData.data.filter((category) => category.products.length > 0);
}

export function getAllProducts(siteData: IMenuData): MenuProduct[] {
  const products: MenuProduct[] = [];
  siteData.data.forEach((category) => {
    // if (!category.deleted_at) {
    //   category.products.forEach((product) => {
    //     products.push(product);
    //   });
    // }
    category.products.forEach((product) => {
      products.push(product);
    });
  });
  return products;
}

export function getProductsByCategory(siteData: IMenuData, categoryId: string): MenuProduct[] {
  const category = siteData.data.find((cat) => cat.id === categoryId);
  return category ? category.products : [];
}

// export function formatPrice(price: number): string {
//   return `€${price.toFixed(2).replace('.', ',')}`;
// }
export const formattedEuroValue = (amount: any) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};
export const formatPrice = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '';

  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return '';
  if (numValue === 0) return '0,00 €';

  let finalValue;
  if (numValue % 1 !== 0) {
    finalValue = numValue.toFixed(2);
  } else {
    finalValue = numValue.toString();
  }

  return formattedEuroValue(finalValue);
};

// export const restaurantInfo: RestaurantInfo = {
//   name: 'Fat Phills The Mall',
//   logo: '/og-logo.png',
//   address: 'Weigelia 19',
//   city: 'Leidschendam',
//   postalCode: '2262 AB',
//   openUntil: '22:50',
//   flag: '🇬🇧',
//   mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=52.089002,4.381865',
// };

// export function getDisplayName(item: { name: string; translations: Array<{ name: string | null; language_id: string }> }, languageId: string = 'en'): string {
//   const translation = item.translations.find((t) => t.language_id === languageId);
//   return translation?.name || item.name;
// }

// export function isRestaurantClosed(): boolean {
//   const now = new Date();
//   const currentTime = now.getHours() * 100 + now.getMinutes();

//   const [closeHour, closeMin] = restaurantInfo.openUntil.split(':').map(Number);
//   const closeTime = closeHour * 100 + closeMin;

//   return currentTime >= closeTime;
// }

// Hack to get data straight from the original site
// const API_BASE_URL = 'https://api.byonesix.com/api/v2';
// const API_HEADERS = {
//   'accept': 'application/json',
//   'accept-language': 'en-US,en;q=0.9',
//   'content-type': 'application/json',
//   'x-gymeyes-location-id': '2663286490888410897',
//   'x-gymeyes-setup-id': '2668345815931557019',
//   'x-gymeyes-token': '1D97BCC8-4B8A-4A8D-989D-152452674AD4',
// };

// export async function fetchMenuData(): Promise<SiteData> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/menu`, {
//       headers: API_HEADERS,
//       next: { revalidate: 60 },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch menu data: ${response.status}`);
//     }

//     const data: SiteData = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching menu data:', error);
//     throw error;
//   }
// }

// export function isProductAvailable(product: MenuProduct): boolean {
// if (!product.in_stock && !product.automatic_in_stock) {
//   return false;
// }

// if (product.available_start && product.available_end) {
//   const now = new Date();
//   const currentTime = now.getHours() * 100 + now.getMinutes();

//   const [startHour, startMin] = product.available_start.split(':').map(Number);
//   const [endHour, endMin] = product.available_end.split(':').map(Number);

//   const startTime = startHour * 100 + startMin;
//   const endTime = endHour * 100 + endMin;

//   if (currentTime < startTime || currentTime > endTime) {
//     return false;
//   }
// }

//   return true;
// }
