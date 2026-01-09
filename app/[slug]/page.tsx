import React, { cache } from 'react';
import HomeScreen from '../components/HomeScreen';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// const API_BASE_URL = 'https://api.paypointpos.de/integration';
const API_BASE_URL = 'http://localhost:4000/integration';
const API_HEADERS = {
  'accept': 'application/json',
  'content-type': 'application/json',
};
// fetch the data of store using slug
const getStoreData = cache(async (slug: string) => {
  // Placeholder for actual data fetching logic
  // api.paypointpos.de/integrations/slug/{slug}
  const response = await fetch(`${API_BASE_URL}/slugs/${slug}`, {
    headers: API_HEADERS,
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch store data');
  }
  const data = await response.json();
  console.log('Store Data:', data?.data);
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
    logo: `https://paypoint-web-storage.s3.eu-central-1.amazonaws.com/menu/${data?.data?.logoFileName}` || null,
    timings: data?.data?.timings || null,
    settings: data?.data?.webShopSettings || null,
    adminGoogleApiKey: data?.data?.adminGoogleApiKey || '',
    posGoogleApiKey: data?.data?.posGoogleApiKey || '',
    postalRates: data?.data?.postalRates || [],
    storeId: data?.data?._id || '',
    adminId: data?.data?.adminId || '',
  };
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (BLOCKED.has(slug)) notFound();
  const store = await getStoreData(slug);

  return {
    title: store.brandName ? `${store.brandName} | Online Ordering` : 'Online Ordering',

    description: store.brandName ? `Order online from ${store.brandName}${store.city ? `, ${store.city}` : ''}` : 'Order food online',

    openGraph: {
      title: store.brandName || 'Online Ordering',
      description: `Order online from ${store.brandName}`,
      images: store.logo ? [store.logo] : [],
    },
  };
}

const BLOCKED = new Set(['favicon.ico', 'robots.txt', 'sitemap.xml']);

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const paramsResult = await params;
  const { slug } = paramsResult;
  if (BLOCKED.has(slug)) notFound();
  const storeInfo = await getStoreData(slug);
  console.log('Store Info:', storeInfo);
  return <HomeScreen storeInfo={storeInfo} />;
};

export default page;
