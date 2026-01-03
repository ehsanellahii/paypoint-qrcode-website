import { SiteData, MenuCategory, Product, RestaurantInfo } from './types';

// Hack to get data straight from the original site
const API_BASE_URL = 'https://api.byonesix.com/api/v2';
const API_HEADERS = {
  'accept': 'application/json',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  'x-gymeyes-location-id': '2663286490888410897',
  'x-gymeyes-setup-id': '2668345815931557019',
  'x-gymeyes-token': '1D97BCC8-4B8A-4A8D-989D-152452674AD4'
};

export async function fetchMenuData(): Promise<SiteData> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      headers: API_HEADERS,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch menu data: ${response.status}`);
    }

    const data: SiteData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching menu data:', error);
    throw error;
  }
}

export function getCategories(siteData: SiteData): MenuCategory[] {
  return siteData.menu.filter(category => 
    category.products.length > 0 && !category.deleted_at
  );
}

export function getAllProducts(siteData: SiteData): Product[] {
  const products: Product[] = [];
  siteData.menu.forEach(category => {
    if (!category.deleted_at) {
      category.products.forEach(product => {
        products.push(product);
      });
    }
  });
  return products;
}

export function getProductsByCategory(siteData: SiteData, categoryId: string): Product[] {
  const category = siteData.menu.find(cat => cat.id === categoryId);
  return category ? category.products : [];
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(2).replace('.', ',')}`;
}

/**
 * Update this with your restaurant's information.
 * This data should ideally come from your backend/CMS.
 */
export const restaurantInfo: RestaurantInfo = {
  name: 'Fat Phills The Mall',
  logo: '/og-logo.png',
  address: 'Weigelia 19',
  city: 'Leidschendam',
  postalCode: '2262 AB',
  openUntil: '22:50',
  flag: '🇬🇧',
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=52.089002,4.381865'
};

export function getDisplayName(
  item: { name: string; translations: Array<{ name: string | null; language_id: string }> },
  languageId: string = 'en'
): string {
  const translation = item.translations.find(t => t.language_id === languageId);
  return translation?.name || item.name;
}

export function isProductAvailable(product: Product): boolean {
  if (!product.in_stock && !product.automatic_in_stock) {
    return false;
  }

  if (product.available_start && product.available_end) {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const [startHour, startMin] = product.available_start.split(':').map(Number);
    const [endHour, endMin] = product.available_end.split(':').map(Number);
    
    const startTime = startHour * 100 + startMin;
    const endTime = endHour * 100 + endMin;
    
    if (currentTime < startTime || currentTime > endTime) {
      return false;
    }
  }

  return true;
}

export function isRestaurantClosed(): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  const [closeHour, closeMin] = restaurantInfo.openUntil.split(':').map(Number);
  const closeTime = closeHour * 100 + closeMin;
  
  return currentTime >= closeTime;
}

