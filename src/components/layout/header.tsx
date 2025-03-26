'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  transparent?: boolean
  className?: string
}

export function Header({ transparent = false, className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const { t, language } = useLanguage()
  const pathname = usePathname()
  
  // 어드민 페이지 여부 확인
  const isAdminPage = pathname?.startsWith('/admin') || false

  // Menu items structure based on the website with translations
  const menuItems = [
    {
      label: t('menu.business'),
      href: '/business',
      submenu: [
        { label: 'SAP', href: '/business/sap' },
        { label: 'AI/RPA', href: '/business/ai-rpa' },
        { label: 'Mendix', href: '/business/mendix' },
        { label: 'AI', href: '/business/ai' },
        { label: 'Salesforce', href: '/business/salesforce' },
        { label: 'ITO(SI/SM)', href: '/business/ito' },
      ],
    },
    {
      label: t('menu.notice'),
      href: '/notice',
      submenu: [
        { label: 'ESG', href: '/notice/esg' },
        { label: 'News', href: '/notice/news' },
        { label: 'Customer', href: '/notice/customer' },
      ],
    },
    {
      label: t('menu.recruit'),
      href: '/recruit',
      submenu: [
        { label: 'Talent', href: '/recruit/talent' },
        { label: 'Benefits', href: '/recruit/benefits' },
        { label: 'Jobs', href: '/recruit/jobs' },
      ],
    },
    {
      label: t('menu.company'),
      href: '/company',
      submenu: [
        { label: 'About', href: '/company/about' },
        { label: 'Partners', href: '/company/partners' },
        { label: 'History', href: '/company/history' },
        { label: t('menu.contact'), href: '/company/contact' },
      ],
    },
  ]

  const toggleSubmenu = (label: string) => {
    setActiveSubmenu(activeSubmenu === label ? null : label)
  }

  return (
    <>
      <div className="h-16" /> {/* 헤더 높이만큼 여백 추가 */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16',
          transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-sm border-b border-gray-200',
          className
        )}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.svg"
            alt="에코잇 로고"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {menuItems.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className="flex items-center text-gray-700 hover:text-echoit-primary transition-colors py-2"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Link>
              {item.submenu && (
                <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-echoit-primary"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {!isAdminPage && (
          <div
            className={cn(
              "fixed inset-0 z-40 bg-white w-full transform transition-transform lg:hidden",
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo.svg"
                  alt="에코잇 로고"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="px-4 py-6 overflow-y-auto">
              {menuItems.map((item) => (
                <div key={item.href} className="mb-4">
                  <div
                    className="flex items-center justify-between py-2 border-b border-gray-100"
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    <Link
                      href={item.href}
                      className="text-gray-800 hover:text-echoit-primary font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.label}
                    </Link>
                    {item.submenu && (
                      <ChevronDown className={cn(
                        "w-5 h-5 transition-transform",
                        activeSubmenu === item.label ? "rotate-180" : ""
                      )} />
                    )}
                  </div>

                  {item.submenu && activeSubmenu === item.label && (
                    <div className="pl-4 py-2 space-y-2">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block py-2 text-sm text-gray-600 hover:text-echoit-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
