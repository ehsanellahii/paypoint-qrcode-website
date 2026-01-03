'use client';

import Image from 'next/image';
import { restaurantInfo } from '@/lib/api';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileRestaurantInfo() {
  return (
    <div className="lg:hidden bg-white" role="banner" aria-label="Restaurant information">
      <div className="px-4 pb-6 pt-5">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-48">
            <Image
              src={restaurantInfo.logo}
              alt={restaurantInfo.name}
              fill
              className="object-contain"
              sizes="140px"
            />
          </div>
        </div>

        {/* Restaurant Name */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {restaurantInfo.name}
        </h1>

        {/* Address */}
        <p className="text-sm text-center text-gray-600 mb-3">
          {restaurantInfo.address}, {restaurantInfo.postalCode}, {restaurantInfo.city}
        </p>

        {/* Flag */}
        <div className="flex justify-center mb-3">
          <div className="bg-gray-100 rounded-full px-4 py-2">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Opening Hours */}
        <div className="flex justify-center">
          <p className="text-sm font-medium text-gray-900" role="status">
            Online open until {restaurantInfo.openUntil}
          </p>
        </div>
      </div>
    </div>
  );
}
