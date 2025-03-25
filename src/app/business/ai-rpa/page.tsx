'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'

// RPA benefits
const rpaBenefits = [
  {
    title: '비즈니스 프로세스 자동화',
    points: [
      '반복적인 업무 자동화로 시간 및 비용 절감',
      '인적 오류 최소화 및 정확도 향상',
      '직원이 고부가가치 업무에 집중할 수 있는 환경 조성',
    ],
    icon: 'https://ext.same-assets.com/1397033195/150488707.png',
  },
  {
    title: '빠른 ROI 달성',
    points: [
      '단기간 내 구축 및 적용 가능',
      '전사적 프로세스 개선을 통한 비용 절감',
      '기존 시스템과의 완벽한 통합',
    ],
    icon: 'https://ext.same-assets.com/1397033195/3488559407.png',
  },
  {
    title: '확장성 및 유연성',
    points: [
      '다양한 업무 프로세스에 적용 가능',
      '시스템 간 데이터 연계 및 통합',
      '비즈니스 요구사항 변화에 빠른 대응',
    ],
    icon: 'https://ext.same-assets.com/1397033195/828377398.png',
  },
  {
    title: '디지털 트랜스포메이션 가속화',
    points: [
      'AI 기술과 결합하여 지능형 자동화 구현',
      '데이터 기반 의사결정 지원',
      '기업 디지털화의 핵심 요소',
    ],
    icon: 'https://ext.same-assets.com/1397033195/1663509900.png',
  },
]

// RPA use cases
const rpaUseCases = [
  {
    title: '금융 및 회계',
    description: '송장 처리, 계정 조정, 재무 보고서 생성, 세금 계산 등의 자동화',
    icon: '/icons/finance.svg',
  },
  {
    title: '인사 관리',
    description: '채용 프로세스, 직원 온보딩, 급여 관리, 휴가 승인 등의 자동화',
    icon: '/icons/hr.svg',
  },
  {
    title: '고객 서비스',
    description: '고객 데이터 관리, 문의 처리, 자동 응답, 티켓 처리 등의 자동화',
    icon: '/icons/customer.svg',
  },
  {
    title: '공급망 관리',
    description: '재고 관리, 주문 처리, 배송 추적, 공급업체 관리 등의 자동화',
    icon: '/icons/supply.svg',
  },
  {
    title: '데이터 처리',
    description: '데이터 수집, 변환, 분석, 보고서 생성 등의 자동화',
    icon: '/icons/data.svg',
  },
  {
    title: 'IT 운영',
    description: '시스템 모니터링, 백업, 패치 관리, 사용자 계정 관리 등의 자동화',
    icon: '/icons/it.svg',
  },
]

export default function AIRPAPage() {
  const { t, language } = useLanguage()

  return (
    <div>
      {/* Hero Banner */}
      <div
        className="bg-echoit-bgDark text-white py-16"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 128, 128, 0.8), rgba(0, 128, 128, 0.8)), url(https://ext.same-assets.com/1397033195/150488707.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="echoit-container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[Raleway]">
            AI/RPA
          </h1>
          <p className="text-gray-300 max-w-2xl">
            {language === 'ko' ?
              '비즈니스 프로세스 자동화를 통한 디지털 혁신' :
              'Digital innovation through business process automation'}
          </p>
        </div>
      </div>

      {/* RPA Overview */}
      <section className="py-16 bg-white">
        <div className="echoit-container">
          <h2 className="section-title">
            {language === 'ko' ?
              'AI/RPA는 비즈니스 혁신의 핵심입니다' :
              'AI/RPA is the key to business innovation'}
          </h2>
          <div className="section-divider"></div>

          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            {language === 'ko' ?
              'RPA(Robotic Process Automation)는 사람이 수행하던 단순 반복적인 업무를 소프트웨어 로봇이 대신 수행하게 하는 기술입니다. AI 기술과 결합하여 더욱 지능적이고 효율적인 비즈니스 프로세스 자동화를 구현합니다.' :
              'RPA (Robotic Process Automation) is a technology that enables software robots to perform repetitive tasks that were previously done by humans. Combined with AI technology, it implements more intelligent and efficient business process automation.'}
          </p>

          {/* RPA Platform Info */}
          <div className="bg-teal-50 p-8 rounded-lg mb-16">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 mb-6 md:mb-0 md:pr-8">
                <h3 className="text-xl font-bold mb-4">
                  {language === 'ko' ?
                    'Brity RPA - 에코아이티의 자동화 솔루션' :
                    'Brity RPA - Echoit\'s Automation Solution'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ko' ?
                    'Brity RPA는 삼성SDS의 RPA 솔루션으로 에코아이티는 공식 파트너로서 ' :
                    'Brity RPA is Samsung SDS\'s RPA solution, and Echoit as an official partner '}
                  <span className="font-bold">
                    {language === 'ko' ?
                      '최고의 구축 서비스를' :
                      'provides the best implementation services'}
                  </span>
                  {language === 'ko' ? ' 제공합니다.' : '.'}
                </p>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-3">
                    {language === 'ko' ? '에코아이티는' : 'Echoit'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'ko' ?
                      'RPA 도입 컨설팅부터 개발, 구축, 운영 및 유지보수까지 RPA 라이프사이클 전 과정을 지원합니다. AI 기술과의 결합을 통해 지능형 자동화 솔루션을 제공합니다.' :
                      'Supports the entire RPA lifecycle from introduction consulting to development, implementation, operation, and maintenance. Provides intelligent automation solutions through combination with AI technology.'}
                  </p>
                </div>
              </div>
              <div className="md:w-3/5">
                <div className="bg-white p-6 rounded-lg border border-gray-200 h-full flex flex-col justify-center items-center">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg">Brity RPA</h3>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                    <div className="flex items-center space-x-2 bg-teal-100 p-3 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                          <line x1="6" y1="6" x2="6.01" y2="6"></line>
                          <line x1="6" y1="18" x2="6.01" y2="18"></line>
                        </svg>
                      </div>
                      <span className="text-sm font-medium">
                        {language === 'ko' ? '프로세스 분석' : 'Process Analysis'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 bg-teal-100 p-3 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm font-medium">
                        {language === 'ko' ? '자동화 개발' : 'Automation Development'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 bg-teal-100 p-3 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 10h-4V4h-4v6H6l6 6 6-6z"></path>
                          <path d="M6 20h12"></path>
                        </svg>
                      </div>
                      <span className="text-sm font-medium">
                        {language === 'ko' ? '구축 및 배포' : 'Deployment'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 bg-teal-100 p-3 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <span className="text-sm font-medium">
                        {language === 'ko' ? '운영 및 유지보수' : 'Operations'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why RPA */}
      <section className="py-16 bg-gray-50">
        <div className="echoit-container">
          <h2 className="section-title">
            {language === 'ko' ? 'AI/RPA의 비즈니스 가치' : 'Business Value of AI/RPA'}
          </h2>
          <div className="section-divider"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {rpaBenefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                    <Image
                      src={benefit.icon}
                      alt={benefit.title}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-bold">{benefit.title}</h3>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  {benefit.points.map((point, idx) => (
                    <li key={idx} className="text-sm">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="section-title">
            {language === 'ko' ? 'AI/RPA 활용 사례' : 'AI/RPA Use Cases'}
          </h2>
          <div className="section-divider"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rpaUseCases.map((useCase, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-teal-600 font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold">{useCase.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="echoit-container text-center">
          <h2 className="text-3xl font-bold mb-6">
            {language === 'ko' ?
              '에코아이티와 함께 AI/RPA 도입을 시작하세요' :
              'Start implementing AI/RPA with Echoit'}
          </h2>
          <p className="mb-8 max-w-2xl mx-auto">
            {language === 'ko' ?
              'AI/RPA 구축 경험이 풍부한 에코아이티는 고객의 니즈에 맞는 최적의 자동화 솔루션을 제공합니다. 지금 문의하시고 비즈니스 프로세스 혁신을 경험하세요.' :
              'Echoit, with extensive experience in AI/RPA implementation, provides the optimal automation solution tailored to your needs. Contact us now and experience business process innovation.'}
          </p>
          <Link
            href="/company/contact"
            className="bg-white text-teal-600 font-medium py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors inline-block"
          >
            {language === 'ko' ? '문의하기' : 'Contact Us'}
          </Link>
        </div>
      </section>
    </div>
  )
}
