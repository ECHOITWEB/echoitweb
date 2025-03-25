'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'

// Service cards data from echoit's homepage
const services = [
  {
    title: 'SAP ERP',
    desc: '비즈니스 프로세스 최적화',
    icon: 'https://ext.same-assets.com/1397033195/971313694.png',
    href: '/business/sap',
    color: 'bg-blue-600',
  },
  {
    title: 'AI/RPA',
    desc: '업무 자동화 및 효율화',
    icon: 'https://ext.same-assets.com/1397033195/150488707.png',
    href: '/business/ai-rpa',
    color: 'bg-teal-500',
  },
  {
    title: 'Low-Code',
    desc: '빠른 애플리케이션 개발',
    icon: 'https://ext.same-assets.com/1397033195/2509476503.png',
    href: '/business/mendix',
    color: 'bg-gray-700',
  },
  {
    title: 'AI',
    desc: '한컴오피스 AI 솔루션',
    icon: 'https://ext.same-assets.com/1397033195/828377398.png',
    href: '/business/ai',
    color: 'bg-echoit-primary',
  },
]

export function TechnologiesSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 bg-white">
      <div className="echoit-container">
        <h2 className="section-title">{t('technologies.title')}</h2>
        <div className="section-divider"></div>

        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-4 rounded-md mb-10">
          <div className="text-sm md:text-base text-gray-700 mb-4 md:mb-0">
            <strong>SAP, AI/RPA, Low-Code, CRM & ITO</strong> {t('technologies.subtitle')}
          </div>
          <Link
            href="/business"
            className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            {t('technologies.more')} →
          </Link>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="flex flex-col h-60 bg-white border border-gray-200 rounded-md overflow-hidden transition-all hover:shadow-md group"
            >
              {/* Card Header with Icon */}
              <div className={`${service.color} p-4 text-white h-16 flex items-center space-x-2`}>
                <div className="w-8 h-8 relative">
                  <Image
                    src={service.icon}
                    alt={service.title}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="font-medium">{service.title}</span>
              </div>

              {/* Card Body */}
              <div className="flex-1 flex items-center justify-center p-6 text-center group-hover:bg-gray-50 transition-colors">
                <p className="text-gray-600">{service.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
