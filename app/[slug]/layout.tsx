import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { CartProvider } from '~/contexts/cart-context';
import { LanguageProvider } from '@/contexts/language-context';
import Script from 'next/script';
import { AddressProvider } from '~/contexts/address-context';
import { UserProvider } from '~/contexts/user-context';
import DebugPersistError from '~/lib/DebugPersistError';
import { getStoreData } from '~/lib/api';
import StoreProvider from '~/contexts/store-context';
import ThemeVars from '~/lib/ThemeVars';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sParams = await searchParams;
  const store = await getStoreData(slug, sParams?.t as string);

  return {
    title: {
      default: 'Order Online',
      template: `%s - ${store?.brandName || 'Online Ordering'}`,
    },
    description: 'Order delicious burgers, wings, and more online',
    openGraph: {
      title: store?.brandName || 'Online Ordering',
      description: store?.brandName ? `Order online from ${store?.brandName}` : 'Order delicious burgers, wings, and more online',
      images: store?.logo ? [store.logo] : [],
    },
  };
}

export default async function RootLayout({
  children,
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  children: React.ReactNode;
}>) {
  const paramsResult = await params;
  const { slug } = paramsResult;
  const sParams = await searchParams;
  const storeInfo = await getStoreData(slug, sParams?.t as string);
  const primaryColor = storeInfo?.settings?.themeColors?.primaryColor;
  const selectedColor = storeInfo?.settings?.themeColors?.selectedTextColor;
  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/logo-light.svg' media='(prefers-color-scheme: light)' />
        <link rel='icon' href='/logo-dark.svg' media='(prefers-color-scheme: dark)' />
        <meta name='color-scheme' content='light' />
      </head>
      <body className={`${inter.variable} antialiased `}>
        <Script
          id='google-maps'
          strategy='afterInteractive'
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        />

        <LanguageProvider>
          <ThemeVars primary={primaryColor} selectedText={selectedColor} />
          <StoreProvider value={storeInfo}>
            <UserProvider>
              <AddressProvider storeKey={slug || 'default'}>
                <DebugPersistError />
                <CartProvider>{children}</CartProvider>
              </AddressProvider>
            </UserProvider>
          </StoreProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
