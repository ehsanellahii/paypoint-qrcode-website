import React from 'react';
import HomeScreen from '../components/HomeScreen';

const API_BASE_URL = 'http://localhost:4000/integration';
const API_HEADERS = {
  'accept': 'application/json',
  'content-type': 'application/json',
};
// fetch the data of store using slug
const getStoreData = async (slug: string) => {
  // Placeholder for actual data fetching logic
  // api.paypointpos.de/integrations/slug/{slug}
  const response = await fetch(`${API_BASE_URL}/slugs/${slug}`, {
    headers: API_HEADERS,
    // next: { revalidate: 60 * 60 * 24 },
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
  };
};

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  console.log('Slug:', slug);
  const storeInfo = await getStoreData(slug);
  console.log('Store Info:', storeInfo);
  return <HomeScreen storeInfo={storeInfo} />;
};

export default page;
