'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const { t, language } = useLanguage()

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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="echoit-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="https://ext.same-assets.com/1397033195/831049508.png"
            alt="ECHOIT"
            width={120}
            height={30}
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          {/* Language switcher - Desktop */}
          <LanguageSwitcher className="mr-6" />

          <nav className="flex space-x-8">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className="text-echoit-text hover:text-echoit-primary px-2 py-2 font-medium"
                >
                  {item.label}
                </Link>

                {/* Dropdown for desktop */}
                {item.submenu && (
                  <div className="absolute left-0 mt-1 w-48 bg-white shadow-lg rounded-md overflow-hidden hidden group-hover:block">
                    <div className="py-2">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm text-echoit-text hover:bg-gray-100 hover:text-echoit-primary"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          {/* Language switcher - Mobile */}
          <LanguageSwitcher />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-4 p-2 text-echoit-text"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white w-full transform transition-transform",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/" className="flex items-center">
            <Image
              src="https://ext.same-assets.com/1397033195/831049508.png"
              alt="ECHOIT"
              width={120}
              height={30}
              className="h-8 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-echoit-text"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 py-6 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label} className="mb-2">
              <div
                className="flex items-center justify-between py-2 border-b border-gray-100"
                onClick={() => toggleSubmenu(item.label)}
              >
                <Link
                  href={item.href}
                  className="text-echoit-text hover:text-echoit-primary font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.label}
                </Link>
                {item.submenu && (
                  <div className="text-echoit-text">
                    {activeSubmenu === item.label ? '-' : '+'}
                  </div>
                )}
              </div>

              {/* Mobile submenu */}
              {item.submenu && activeSubmenu === item.label && (
                <div className="pl-4 py-2 space-y-2">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className="block py-2 text-sm text-echoit-text hover:text-echoit-primary"
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
    </header>
  )
}
