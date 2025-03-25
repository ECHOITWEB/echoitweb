'use client'

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'

// Customer logos from website
const customers = [
  {
    name: "한국항공우주산업",
    logo: "https://ext.same-assets.com/1397033195/336620597.png",
  },
  {
    name: "현대자동차",
    logo: "https://ext.same-assets.com/1397033195/1060848517.png",
  },
  {
    name: "LG Energy Solution",
    logo: "https://ext.same-assets.com/1397033195/3411686925.png",
  },
  {
    name: "삼성전자",
    logo: "https://ext.same-assets.com/1397033195/4249934567.png",
  },
  {
    name: "한국철도공사",
    logo: "https://ext.same-assets.com/1397033195/166477904.png",
  },
  {
    name: "동성그룹",
    logo: "https://ext.same-assets.com/1397033195/1768580065.png",
  },
  {
    name: "SR",
    logo: "https://ext.same-assets.com/1397033195/3225914766.png",
  },
  {
    name: "서울도시가스",
    logo: "https://ext.same-assets.com/1397033195/1824585663.png",
  },
  {
    name: "한국공항공사",
    logo: "https://ext.same-assets.com/1397033195/955930876.png",
  },
  {
    name: "한국도시철도",
    logo: "https://ext.same-assets.com/1397033195/3722859531.png",
  },
  {
    name: "키텍",
    logo: "https://ext.same-assets.com/1397033195/2613601373.png",
  },
  {
    name: "한국나사",
    logo: "https://ext.same-assets.com/1397033195/2377749951.png",
  },
]

export function CustomersSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 bg-white">
      <div className="echoit-container">
        <h2 className="section-title">{t('customers.title')}</h2>
        <div className="section-divider"></div>

        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          {t('customers.subtitle')}
        </p>

        {/* Customer Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {customers.map((customer) => (
            <div
              key={customer.name}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow"
            >
              <div className="w-full h-20 relative mb-2 flex items-center justify-center">
                <Image
                  src={customer.logo}
                  alt={customer.name}
                  width={120}
                  height={60}
                  className="max-h-[60px] w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">{customer.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
