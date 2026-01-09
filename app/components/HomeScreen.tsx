/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileRestaurantInfo from '@/components/MobileRestaurantInfo';
import MobileCategoryBar from '@/components/MobileCategoryBar';
import ProductCard from '@/components/ProductCard';
import ProductModal from '~/components/dialogs/ProductModal';
import BottomBar from '@/components/BottomBar';
import Footer from '@/components/Footer';
import { IStoreInfo } from '@/lib/types';
import { fetchMenuData, getCategories } from '@/lib/api';
import { IMenuData, MenuProduct } from '~/lib/utils';

export default function HomeScreen({ storeInfo }: { storeInfo?: IStoreInfo }) {
  const [menuData, setMenuData] = useState<IMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const data = await fetchMenuData(storeInfo?.adminId, storeInfo?.storeId);
        console.log('Fetched Menu Data:', data);
        setMenuData(data);
        const categories = getCategories(data);
        if (categories.length > 0) {
          setActiveCategory(categories[0].id);
        }
      } catch (err: any) {
        console.log('Error fetching menu data:', err);
        setError(err?.message ?? 'Failed to load menu data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [storeInfo?.adminId, storeInfo?.storeId]);

  const productsByCategory = menuData ? getCategories(menuData) : [];

  useEffect(() => {
    if (!menuData) return;

    const options = {
      root: null,
      rootMargin: '-100px 0px -60% 0px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.id.replace('category-', '');
          setActiveCategory(categoryId);
        }
      });
    }, options);

    const categoryElements = document.querySelectorAll('[id^="category-"]');
    categoryElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [menuData]);

  const handleProductClick = (product: MenuProduct) => {
    // if (product.in_stock || product.automatic_in_stock) {
    //   setSelectedProduct(product);
    //   setIsModalOpen(true);
    // }
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>{error || 'Failed to load menu'}</p>
          <button onClick={() => window.location.reload()} className='bg-[#ffc338] px-6 py-2 rounded-lg font-medium'>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Sidebar Navigation */}
      <Sidebar categories={productsByCategory} activeCategory={activeCategory} onCategoryClick={setActiveCategory} logo={storeInfo?.logo || ''} />

      {/* Main Content Area */}
      <div className='lg:ml-40'>
        {/* Header - part of main content flow */}
        <Header storeInfo={storeInfo} />

        {/* Mobile Restaurant Info - shows below header on mobile */}
        <div className='lg:hidden'>
          <MobileRestaurantInfo storeInfo={storeInfo} />
        </div>

        {/* Mobile Category Bar - shows below mobile restaurant info */}
        <MobileCategoryBar categories={productsByCategory} activeCategory={activeCategory} onCategoryClick={setActiveCategory} />

        {/* Main Content - Single Scroll with All Products */}
        <main className='px-4 md:px-6 lg:px-8 py-6 md:py-8 pb-24 lg:pb-8' role='main'>
          {productsByCategory.map((category) => (
            <section key={category.id} id={`category-${category.id}`} className='mb-16 scroll-mt-16 lg:scroll-mt-24' aria-labelledby={`heading-${category.id}`}>
              {/* Category Header */}
              <div className='mb-6 md:mb-8 flex justify-center'>
                <h2 id={`heading-${category.id}`} className='text-2xl md:text-3xl font-bold text-gray-900 text-center'>
                  {category.name}
                </h2>
              </div>

              {/* Products Grid */}
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6' role='list' aria-label={`${category.name} products`}>
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      {/* Product Detail Modal */}
      <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={handleCloseModal} />

      {/* Bottom Bar with Cart */}
      <BottomBar storeInfo={storeInfo} />

      {/* Footer */}
      <Footer storeInfo={storeInfo} />
    </div>
  );
}
