'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Language } from '@/lib/i18n';

const flags = {
  de: (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 513 342' className='w-10 h-7 rounded'>
      <path fill='#D80027' d='M0 0h513v342H0z' />
      <path d='M0 0h513v114H0z' />
      <path fill='#FFDA44' d='M0 228h513v114H0z' />
    </svg>
  ),
  en: (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 513 342' className='w-10 h-7 rounded'>
      <g fill='#FFF'>
        <path d='M0 0h513v341.3H0V0z' />
        <path d='M311.7 230 513 341.3v-31.5L369.3 230h-57.6zM200.3 111.3 0 0v31.5l143.7 79.8h56.6z' />
      </g>
      <path
        d='M393.8 230 513 295.7V230H393.8zm-82.1 0L513 341.3v-31.5L369.3 230h-57.6zm146.9 111.3-147-81.7v81.7h147zM90.3 230 0 280.2V230h90.3zm110 14.2v97.2H25.5l174.8-97.2zm-82.1-132.9L0 45.6v65.7h118.2zm82.1 0L0 0v31.5l143.7 79.8h56.6zM53.4 0l147 81.7V0h-147zm368.3 111.3L513 61.1v50.2h-91.3zm-110-14.2V0h174.9L311.7 97.1z'
        fill='#0052B4'
      />
      <g fill='#D80027'>
        <path d='M288 0h-64v138.7H0v64h224v138.7h64V202.7h224v-64H288V0z' />
        <path d='M311.7 230 513 341.3v-31.5L369.3 230h-57.6zm-168 0L0 309.9v31.5L200.3 230h-56.6zm56.6-118.7L0 0v31.5l143.7 79.8h56.6zm168 0L513 31.5V0L311.7 111.3h56.6z' />
      </g>
    </svg>
  ),
};

const languageLabels = {
  en: 'English',
  de: 'Deutsch',
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-center px-1 py-2 md:px-4 md:py-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors'
        aria-label={`Current language: ${languageLabels[language]}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup='true'>
        {flags[language]}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50' role='menu' aria-label='Language options'>
          {Object.entries(flags).map(([lang, flag]) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang as Language)}
              className={`w-full flex items-center justify-center hover:bg-gray-50 py-2 px-3 transition-colors ${language === lang ? 'bg-gray-50' : ''}`}
              role='menuitem'
              aria-label={`Switch to ${languageLabels[lang as Language]}${language === lang ? ' (current)' : ''}`}
              aria-current={language === lang ? 'true' : undefined}>
              {flag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
