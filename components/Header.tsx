"use client";

import { restaurantInfo } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header
      className="hidden lg:block bg-white border-b border-gray-100"
      role="banner"
    >
      <div className="flex items-center lg:px-6 py-3 lg:py-4">
        {/* Left section - Growing container with line and store hours */}
        <div className="flex grow items-center">
          {/* Horizontal line with max-width */}
          <div className="w-full md:w-80 md:mr-2">
            <div className="h-2 bg-gray-200 rounded-full"></div>
        </div>

          {/* Store hours badge */}
          <div
            className="bg-gray-200 rounded-full px-4 py-3 flex items-center text-sm mr-2"
            role="status"
            aria-label="Store hours"
          >
            <p className="font-medium text-gray-700 whitespace-nowrap">
              {t.openUntil} {restaurantInfo.openUntil}
            </p>
          </div>
        </div>

        {/* Right section with store info and actions */}
        <div className="flex items-center">
          {/* Store info */}
          <div
            className="bg-gray-200 rounded-full py-3 px-4 flex items-center text-sm mr-2"
            role="contentinfo"
            aria-label="Store location"
          >
            <div className="font-semibold mr-3">{restaurantInfo.name}</div>
            <div className="text-gray-600">{restaurantInfo.address}, {restaurantInfo.postalCode}, {restaurantInfo.city}</div>
          </div>

          <LanguageSwitcher />
          
          <a 
            href={restaurantInfo.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-200 rounded-full py-3 px-4 flex items-center text-sm"
            aria-label="View location on Google Maps"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500 mr-1"
            >
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1={9} y1={3} x2={9} y2={18} />
              <line x1={15} y1={6} x2={15} y2={21} />
            </svg>
            <span className="text-sm font-medium">{t.location}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
