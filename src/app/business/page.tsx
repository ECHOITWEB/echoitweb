'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'

// Business services from the website
const services = [
  {
    title: 'SAP ERP',
    description: '비즈니스 프로세스 최적화와 데이터 통합을 통한 효율적인 경영 관리',
    icon: 'https://ext.same-assets.com/1397033195/971313694.png',
    href: '/business/sap',
    color: 'bg-blue-600',
  },
  {
    title: 'AI/RPA',
    description: 'Brity RPA를 활용한 업무 자동화 및 효율화, 생산성 향상',
    icon: 'https://ext.same-assets.com/1397033195/150488707.png',
    href: '/business/ai-rpa',
    color: 'bg-teal-500',
  },
  {
    title: 'Mendix',
    description: '로우 코드 플랫폼을 통한 빠른 애플리케이션 개발 및 배포',
    icon: 'https://ext.same-assets.com/1397033195/2509476503.png',
    href: '/business/mendix',
    color: 'bg-gray-700',
  },
  {
    title: 'AI',
    description: '한컴오피스 AI 솔루션과 지능형 서비스 구축',
    icon: 'https://ext.same-assets.com/1397033195/828377398.png',
    href: '/business/ai',
    color: 'bg-echoit-primary',
  },
  {
    title: 'Salesforce',
    description: '클라우드 기반 CRM 솔루션으로 고객 관계 관리 효율화',
    icon: 'https://ext.same-assets.com/1397033195/3488559407.png',
    href: '/business/salesforce',
    color: 'bg-blue-500',
  },
  {
    title: 'ITO(SI/SM)',
    description: '맞춤형 시스템 구축 및 유지보수 서비스',
    icon: 'https://ext.same-assets.com/1397033195/1663509900.png',
    href: '/business/ito',
    color: 'bg-gray-600',
  },
]

export default function BusinessPage() {
  const { t } = useLanguage()

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-echoit-bgDark text-white py-16">
        <div className="echoit-container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[Raleway]">
            {t('business.title')}
          </h1>
          <p className="text-gray-300 max-w-2xl">
            {t('business.subtitle')}
          </p>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="echoit-container">
          <h2 className="section-title">{t('technologies.title')}</h2>
          <div className="section-divider"></div>

          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            <strong>SAP, AI/RPA, Low-Code, CRM & ITO</strong> {t('technologies.subtitle')}
          </p>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className={`${service.color} p-5 h-24 flex items-center space-x-3`}>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Image
                      src={service.icon}
                      alt={service.title}
                      width={30}
                      height={30}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white">{service.title}</h3>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-600 mb-4 flex-1">{service.description}</p>
                  <div className="text-echoit-primary group-hover:text-echoit-secondary font-medium transition-colors flex justify-end">
                    {t('business.details')} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
