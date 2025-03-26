'use client'

import React from 'react'
import { useLanguage } from '@/context/language-context'
import ReactCountryFlag from 'react-country-flag'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  iconStyle?: boolean
  className?: string
}

export function LanguageSwitcher({ iconStyle = false, className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <button
        onClick={() => setLanguage('ko')}
        className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded transition-colors",
          language === 'ko' 
            ? "bg-echoit-primary/10 text-echoit-primary" 
            : "hover:bg-gray-100"
        )}
        aria-label="한국어로 전환"
      >
        <ReactCountryFlag
          countryCode="KR"
          svg
          style={{
            width: '1.25em',
            height: '1.25em',
          }}
          className={cn(
            "rounded-sm transition-opacity",
            language !== 'ko' && "opacity-50"
          )}
        />
        {!iconStyle && <span>한국어</span>}
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded transition-colors",
          language === 'en' 
            ? "bg-echoit-primary/10 text-echoit-primary" 
            : "hover:bg-gray-100"
        )}
        aria-label="Switch to English"
      >
        <ReactCountryFlag
          countryCode="US"
          svg
          style={{
            width: '1.25em',
            height: '1.25em',
          }}
          className={cn(
            "rounded-sm transition-opacity",
            language !== 'en' && "opacity-50"
          )}
        />
        {!iconStyle && <span>English</span>}
      </button>
    </div>
  )
}
