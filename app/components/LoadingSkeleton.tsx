import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className='min-h-screen bg-gray-50 pb-24 lg:pb-8'>
      {/* Header Skeleton */}
      <div className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200'>
        <div className='flex items-center justify-between px-3 md:px-6 py-3 md:py-4 gap-2 md:gap-4'>
          <div className='h-8 w-16 bg-gray-200 rounded animate-pulse' />
          <div className='hidden lg:flex flex-1 justify-center'>
            <div className='h-10 w-48 bg-gray-200 rounded-full animate-pulse' />
          </div>
          <div className='flex items-center gap-2 md:gap-4'>
            <div className='hidden md:block h-12 w-48 bg-gray-200 rounded-full animate-pulse' />
            <div className='h-10 w-24 bg-gray-200 rounded-full animate-pulse' />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className='pt-20 md:pt-24 lg:pt-24 flex'>
        {/* Desktop Sidebar Skeleton */}
        <aside className='hidden lg:block fixed left-0 top-24 w-40 h-[calc(100dvh-6rem)] overflow-y-auto pb-8'>
          <nav className='flex flex-col gap-2 p-4'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className='bg-white rounded-xl p-4 flex flex-col items-center gap-2'>
                <div className='w-12 h-12 bg-gray-200 rounded-full animate-pulse' />
                <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile Category Nav Skeleton */}
        <div className='lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40'>
          <div className='flex gap-1 p-2'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='flex flex-col items-center gap-1 px-3 py-2 min-w-[70px]'>
                <div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse' />
                <div className='h-3 w-12 bg-gray-200 rounded animate-pulse' />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <main className='flex-1 lg:ml-40 px-4 md:px-6 lg:px-8 py-6 md:py-8 pt-24 lg:pt-6'>
          {[1, 2].map((section) => (
            <section key={section} className='mb-16'>
              <div className='mb-6 md:mb-8'>
                <div className='h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto lg:mx-0' />
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6'>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className='bg-white rounded-2xl overflow-hidden'>
                    <div className='w-full aspect-square bg-gray-200 animate-pulse' />
                    <div className='p-3 md:p-4 flex flex-col items-center text-center gap-2'>
                      <div className='h-4 w-3/4 bg-gray-200 rounded animate-pulse' />
                      <div className='h-5 w-16 bg-gray-200 rounded animate-pulse' />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
