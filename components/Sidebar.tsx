'use client';

import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { useScrollDetection, useSmoothScroll } from '@/hooks/useScrollDetection';
import { useCart } from '@/lib/cart-context';
import { getImageURL, MenuCategory } from '~/lib/utils';

interface SidebarProps {
  categories: MenuCategory[];
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
  logo?: string;
}

export default function Sidebar({ categories, activeCategory, onCategoryClick, logo }: SidebarProps) {
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  // Use scroll detection hooks
  const desktopScroll = useScrollDetection(desktopScrollRef, 'vertical');

  const { scrollBy: scrollDesktop } = useSmoothScroll(desktopScrollRef);

  // Auto-scroll to active category when it changes
  useEffect(() => {
    const scrollToActiveCategory = () => {
      // Desktop sidebar
      const desktopContainer = desktopScrollRef.current;
      if (desktopContainer) {
        const activeButton = desktopContainer.querySelector(`button[data-category="${activeCategory}"]`);
        if (activeButton) {
          const containerRect = desktopContainer.getBoundingClientRect();
          const buttonRect = activeButton.getBoundingClientRect();
          const relativeTop = buttonRect.top - containerRect.top + desktopContainer.scrollTop;
          const targetScroll = relativeTop - containerRect.height / 2 + buttonRect.height / 2;

          desktopContainer.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'smooth',
          });
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(scrollToActiveCategory, 100);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const isMobile = window.innerWidth < 1024;
      const headerOffset = isMobile ? 60 : 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    onCategoryClick(categoryId);
  };

  const scrollDesktopCategories = (direction: 'up' | 'down') => {
    const amount = direction === 'up' ? -150 : 150;
    scrollDesktop(amount, 'vertical');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className='hidden lg:block fixed left-0 top-0 w-40 h-screen pb-20 bg-white'
        aria-label='Category navigation'
        style={{
          paddingBottom: totalItems > 0 ? '6rem' : '1.25rem',
        }}>
        {/* Logo at top of sidebar */}
        <div className='p-4 py-10' role='img' aria-label='Fat Phills logo'>
          <Image width={100} height={100} src={logo || '/og-logo.png'} alt='Logo' />
        </div>

        {/* Up Arrow */}
        {desktopScroll.canScrollUp && (
          <button
            onClick={() => scrollDesktopCategories('up')}
            className='absolute top-38 left-1/2 -translate-x-1/2 z-10 rounded-full p-2 shadow-md'
            style={{ backgroundColor: '#ffc338' }}
            aria-label='Scroll up'>
            <ChevronUp className='h-5 w-5 text-gray-700' />
          </button>
        )}

        <nav
          ref={desktopScrollRef}
          className='flex flex-col gap-2 p-6 pl-4 pt-4 pb-20 h-[calc(100%-80px)] overflow-y-auto scrollbar-hide'
          role='navigation'
          aria-label='Product categories'>
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const categoryImage = getImageURL(category.image || (category.products[0]?.images.length ? category.products[0].images[0] : '') || '');

            return (
              <button
                key={category.id}
                data-category={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  flex flex-col items-center justify-center gap-2 p-1.5 rounded-lg
                  ${isActive ? 'bg-[#ffc338]' : 'bg-white'}
                `}
                aria-label={`${category.name} category${isActive ? ' (active)' : ''}`}
                aria-current={isActive ? 'true' : undefined}>
                <div className='relative w-16 h-16 rounded-lg overflow-hidden'>
                  {categoryImage && <Image src={categoryImage} alt={category.name} fill className='object-contain' sizes='64px' />}
                </div>
                <span className={`text-sm font-bold text-center ${isActive ? 'text-black' : 'text-gray-700'}`}>{category.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Down Arrow */}
        {desktopScroll.canScrollDown && (
          <button
            onClick={() => scrollDesktopCategories('down')}
            className='absolute left-1/2 -translate-x-1/2 z-10 bg-white rounded-full p-2 shadow-md'
            style={{
              bottom: totalItems > 0 ? '7rem' : '0.5rem',
              backgroundColor: '#ffc338',
            }}
            aria-label='Scroll down'>
            <ChevronDown className='h-5 w-5 text-gray-700' />
          </button>
        )}
      </aside>
    </>
  );
}
