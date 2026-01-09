import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { CartProvider } from '@/lib/cart-context';
import { LanguageProvider } from '@/lib/language-context';
import Script from 'next/script';
import { AddressProvider } from '~/lib/address-context';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Order Online',
  description: 'Order delicious burgers, wings, and more from Fat Phills The Mall in Leidschendam',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <AddressProvider storeKey={'default'}>
            <CartProvider>{children}</CartProvider>
          </AddressProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
