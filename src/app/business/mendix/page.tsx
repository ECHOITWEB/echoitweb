'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'

// Mendix advantages
const mendixAdvantages = [
  {
    title: '빠른 애플리케이션 개발',
    points: [
      '시각적 모델링 도구를 통한 빠른 개발',
      '드래그 앤 드롭 인터페이스로 손쉬운 앱 구축',
      '코드 작성 없이 비즈니스 로직 구현',
    ],
    icon: 'https://ext.same-assets.com/1397033195/2509476503.png',
  },
  {
    title: '엔터프라이즈급 확장성',
    points: [
      '고성능 애플리케이션 구축 가능',
      '대규모 사용자와 복잡한 비즈니스 로직 처리',
      '기존 시스템 및 서비스와의 통합',
    ],
    icon: 'https://ext.same-assets.com/1397033195/3488559407.png',
  },
  {
    title: '멀티 채널 지원',
    points: [
      '한 번의 개발로 다양한 디바이스에서 실행',
      '웹, 모바일, 태블릿 등 모든 환경 지원',
      '네이티브 모바일 경험 제공',
    ],
    icon: 'https://ext.same-assets.com/1397033195/828377398.png',
  },
  {
    title: '협업 및 거버넌스',
    points: [
      '개발자와 비즈니스 담당자 간 원활한 협업',
      '버전 관리, 품질 보증, 개발 워크플로우 관리',
      'DevOps 및 CI/CD 프로세스 지원',
    ],
    icon: 'https://ext.same-assets.com/1397033195/1663509900.png',
  },
]

// Mendix use cases
const mendixUseCases = [
  {
    title: '고객 경험(CX) 애플리케이션',
    description: '고객 셀프 서비스 포털, 모바일 앱, 온라인 예약 시스템',
  },
  {
    title: '운영 효율화 애플리케이션',
    description: '워크플로우 자동화, 프로세스 최적화, 자원 관리 시스템',
  },
  {
    title: '레거시 시스템 현대화',
    description: '오래된 시스템을 현대적이고 유연한 애플리케이션으로 전환',
  },
  {
    title: '데이터 중심 애플리케이션',
    description: '비즈니스 인텔리전스, 데이터 시각화, 분석 도구',
  },
  {
    title: 'IoT 및 스마트 산업',
    description: '센서 데이터 처리, 모니터링 대시보드, 예측 유지보수 솔루션',
  },
]

export default function MendixPage() {
  const { t, language } = useLanguage()

  return (
    <div>
      {/* Hero Banner */}
      <div
        className="bg-echoit-bgDark text-white py-16"
        style={{
          backgroundImage: 'linear-gradient(rgba(42, 42, 50, 0.8), rgba(42, 42, 50, 0.8)), url(https://ext.same-assets.com/1397033195/2509476503.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="echoit-container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[Raleway]">
            Mendix
          </h1>
          <p className="text-gray-300 max-w-2xl">
            {language === 'ko' ?
              '로우코드 플랫폼을 통한 신속한 애플리케이션 개발' :
              'Rapid application development through low-code platform'}
          </p>
        </div>
      </div>

      {/* Mendix Overview */}
      <section className="py-16 bg-white">
        <div className="echoit-container">
          <h2 className="section-title">
            {language === 'ko' ?
              'Mendix는 애플리케이션 개발의 혁신입니다' :
              'Mendix is the innovation of application development'}
          </h2>
          <div className="section-divider"></div>

          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            {language === 'ko' ?
              'Mendix는 기업이 최소한의 코딩으로 엔터프라이즈급 애플리케이션을 빠르게 개발하고 배포할 수 있는 로우코드 플랫폼입니다. 비즈니스 요구사항이 빠르게 변화하는 시대에, Mendix는 기업의 디지털 혁신을 가속화합니다.' :
              'Mendix is a low-code platform that enables enterprises to quickly develop and deploy enterprise-grade applications with minimal coding. In an era of rapidly changing business requirements, Mendix accelerates digital transformation of enterprises.'}
          </p>

          {/* Mendix Platform Info */}
          <div className="bg-gray-50 p-8 rounded-lg mb-16">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 mb-6 md:mb-0 md:pr-8">
                <h3 className="text-xl font-bold mb-4">
                  {language === 'ko' ?
                    'Siemens의 Mendix - 로우코드의 새 기준' :
                    'Siemens\' Mendix - The new standard for low-code'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ko' ?
                    'Mendix는 Siemens의 로우코드 개발 플랫폼으로 에코아이티는 공식 파트너로서 ' :
                    'Mendix is Siemens\' low-code development platform, and Echoit as an official partner '}
                  <span className="font-bold">
                    {language === 'ko' ?
                      '최고의 개발 및 구축 서비스를' :
                      'provides the best development and implementation services'}
                  </span>
                  {language === 'ko' ? ' 제공합니다.' : '.'}
                </p>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-3">
                    {language === 'ko' ? '에코아이티는' : 'Echoit'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'ko' ?
                      'Mendix를 활용한 애플리케이션 설계, 개발, 배포부터 유지보수까지 전체 라이프사이클을 지원합니다. 비즈니스 요구사항을 빠르게 충족시키는 맞춤형 솔루션을 제공합니다.' :
                      'Supports the entire lifecycle from application design, development, deployment to maintenance using Mendix. Provides customized solutions that quickly meet business requirements.'}
                  </p>
                </div>
              </div>
              <div className="md:w-3/5">
                <div className="relative bg-white p-6 rounded-lg border border-gray-200 h-full">
                  <div className="absolute top-6 right-6">
                    <div className="text-xs bg-gray-200 rounded px-2 py-1">
                      Siemens Partner
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-6">
                    {language === 'ko' ? 'Mendix 개발 프로세스' : 'Mendix Development Process'}
                  </h3>

                  <div className="flex flex-col space-y-6">
                    <div className="flex">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
                        <span>1</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">
                          {language === 'ko' ? '비즈니스 요구사항 정의' : 'Define Business Requirements'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language === 'ko' ?
                            '고객의 비즈니스 요구사항을 분석하고 명확한 개발 목표 설정' :
                            'Analyze customer business requirements and set clear development goals'}
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
                        <span>2</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">
                          {language === 'ko' ? '애플리케이션 설계' : 'Application Design'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language === 'ko' ?
                            'Mendix Studio Pro를 사용하여 데이터 모델, UI, 비즈니스 로직 설계' :
                            'Design data models, UI, and business logic using Mendix Studio Pro'}
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
                        <span>3</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">
                          {language === 'ko' ? '빠른 개발 및 테스트' : 'Rapid Development and Testing'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language === 'ko' ?
                            '시각적 개발 도구를 활용한 신속한 개발과 실시간 테스트' :
                            'Rapid development using visual development tools and real-time testing'}
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
                        <span>4</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">
                          {language === 'ko' ? '배포 및 운영' : 'Deployment and Operations'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language === 'ko' ?
                            '클라우드 또는 온프레미스 환경에 손쉬운 배포 및 효율적인 운영' :
                            'Easy deployment to cloud or on-premises environments and efficient operations'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Mendix */}
      <section className="py-16 bg-gray-50">
        <div className="echoit-container">
          <h2 className="section-title">
            {language === 'ko' ? 'Mendix의 주요 장점' : 'Key Benefits of Mendix'}
          </h2>
          <div className="section-divider"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {mendixAdvantages.map((advantage, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <Image
                      src={advantage.icon}
                      alt={advantage.title}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-bold">{advantage.title}</h3>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  {advantage.points.map((point, idx) => (
                    <li key={idx} className="text-sm">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="section-title">
            {language === 'ko' ? 'Mendix 활용 사례' : 'Mendix Use Cases'}
          </h2>
          <div className="section-divider"></div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mendixUseCases.map((useCase, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white mr-3">
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold">{useCase.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{useCase.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                {language === 'ko' ?
                  'Mendix의 유연한 개발 환경은 다양한 산업과 비즈니스 영역에서 활용됩니다.' :
                  'Mendix\'s flexible development environment is utilized in various industries and business areas.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-700 text-white">
        <div className="echoit-container text-center">
          <h2 className="text-3xl font-bold mb-6">
            {language === 'ko' ?
              '에코아이티와 함께 Mendix 개발을 시작하세요' :
              'Start Mendix development with Echoit'}
          </h2>
          <p className="mb-8 max-w-2xl mx-auto">
            {language === 'ko' ?
              'Mendix 파트너인 에코아이티는 로우코드 기술을 통해 고객의 디지털 혁신을 가속화합니다. 지금 문의하시고 신속한 애플리케이션 개발을 경험하세요.' :
              'Echoit, a Mendix partner, accelerates customers\' digital transformation through low-code technology. Contact us now and experience rapid application development.'}
          </p>
          <Link
            href="/company/contact"
            className="bg-white text-gray-700 font-medium py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors inline-block"
          >
            {language === 'ko' ? '문의하기' : 'Contact Us'}
          </Link>
        </div>
      </section>
    </div>
  )
}
