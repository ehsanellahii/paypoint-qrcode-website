import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { CartProvider } from '@/lib/cart-context';
import { LanguageProvider } from '@/lib/language-context';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Fat Phills The Mall - Order Online',
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
      <body className={`${inter.variable} antialiased`}>
        <LanguageProvider>
          <CartProvider>{children}</CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
