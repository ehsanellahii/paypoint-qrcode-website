import React from 'react';
import HomeScreen from '../components/HomeScreen';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreData } from '~/lib/api';

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

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
  console.log('Formatted Store Info:', storeInfo);
  return <HomeScreen storeInfo={storeInfo} />;
};

export default page;
