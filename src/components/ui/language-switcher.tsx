'use client'

import React from 'react'
import { useLanguage } from '@/context/language-context'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={cn("flex items-center", className)}>
      <button
        onClick={() => setLanguage('ko')}
        className={cn(
          "px-2 py-1 text-sm transition-colors",
          language === 'ko'
            ? "font-bold text-echoit-primary"
            : "text-gray-500 hover:text-gray-700"
        )}
        aria-label="Switch to Korean"
      >
        KO
      </button>
      <span className="text-gray-300 mx-1">|</span>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-2 py-1 text-sm transition-colors",
          language === 'en'
            ? "font-bold text-echoit-primary"
            : "text-gray-500 hover:text-gray-700"
        )}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  )
}
