'use client';

import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuCategory } from '@/lib/types';
import { useScrollDetection, useSmoothScroll } from '@/hooks/useScrollDetection';

interface MobileCategoryBarProps {
  categories: MenuCategory[];
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

export default function MobileCategoryBar({ categories, activeCategory, onCategoryClick }: MobileCategoryBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileScroll = useScrollDetection(scrollContainerRef, 'horizontal');
  const { scrollBy: scrollMobile } = useSmoothScroll(scrollContainerRef);

  // Auto-scroll to active category when it changes
  useEffect(() => {
    const scrollToActiveCategory = () => {
      const mobileContainer = scrollContainerRef.current;
      if (mobileContainer) {
        const activeButton = mobileContainer.querySelector(`button[data-category="${activeCategory}"]`);
        if (activeButton) {
          const containerRect = mobileContainer.getBoundingClientRect();
          const buttonRect = activeButton.getBoundingClientRect();
          const relativeLeft = buttonRect.left - containerRect.left + mobileContainer.scrollLeft;
          const targetScroll = relativeLeft - (containerRect.width / 2) + (buttonRect.width / 2);
          
          mobileContainer.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: 'smooth'
          });
        }
      }
    };

    const timer = setTimeout(scrollToActiveCategory, 100);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerOffset = 60;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    onCategoryClick(categoryId);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    const amount = direction === 'left' ? -200 : 200;
    scrollMobile(amount, 'horizontal');
  };

  return (
    <div className="lg:hidden sticky top-0 left-0 right-0 bg-white border-b border-gray-200 z-40" role="navigation" aria-label="Category navigation">
      <div className="relative">
        {/* Left Arrow */}
        {mobileScroll.canScrollLeft && (
          <button
            onClick={() => scrollCategories('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 shadow-md ml-1"
            style={{ backgroundColor: "#ffc338" }}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex gap-1 p-2 overflow-x-auto scrollbar-hide touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const categoryImage = category.image || (category.products[0]?.image || '');

            return (
              <button
                key={category.id}
                data-category={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[80px] shrink-0
                  ${isActive
                    ? 'bg-[#ffc338]'
                    : 'bg-white'
                  }
                `}
                aria-label={`${category.name} category${isActive ? ' (active)' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  {categoryImage && (
                    <Image
                      src={categoryImage}
                      alt={category.name}
                      fill
                      className="object-contain"
                      sizes="40px"
                    />
                  )}
                </div>
                <span className={`text-xs font-medium text-center ${isActive ? 'text-black' : 'text-gray-700'}`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        {mobileScroll.canScrollRight && (
          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 shadow-md mr-1"
            style={{ backgroundColor: "#ffc338" }}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
}

