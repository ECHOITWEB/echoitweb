'use client'

import React from 'react'
import { useLanguage } from '@/context/language-context'
import ReactCountryFlag from 'react-country-flag'
import { Button } from './button'
import { translateText } from '@/lib/utils/translation'

interface LanguageSwitcherProps {
  iconStyle?: boolean;
  onLanguageChange?: (lang: 'ko' | 'en') => void;
}

export function LanguageSwitcher({ iconStyle = false, onLanguageChange }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  const handleLanguageChange = async (newLang: 'ko' | 'en') => {
    setLanguage(newLang)
    if (onLanguageChange) {
      onLanguageChange(newLang)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={language === 'ko' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleLanguageChange('ko')}
        className="flex items-center space-x-1"
      >
        <ReactCountryFlag
          countryCode="KR"
          svg
          style={{
            width: '1.2em',
            height: '1.2em',
          }}
          title="South Korea"
        />
        {!iconStyle && <span>한국어</span>}
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleLanguageChange('en')}
        className="flex items-center space-x-1"
      >
        <ReactCountryFlag
          countryCode="US"
          svg
          style={{
            width: '1.2em',
            height: '1.2em',
          }}
          title="United States"
        />
        {!iconStyle && <span>English</span>}
      </Button>
    </div>
  )
}
