'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

// SAP Modules
const sapModules = [
  { id: 'FI', name: 'Financial Accounting', description: '재무회계' },
  { id: 'CO', name: 'Controlling', description: '관리회계' },
  { id: 'SD', name: 'Sales and Distribution', description: '영업 및 배송' },
  { id: 'MM', name: 'Material Management', description: '자재관리' },
  { id: 'PP', name: 'Production Planning', description: '생산계획' },
  { id: 'PM', name: 'Plant Maintenance', description: '설비관리' },
  { id: 'QM', name: 'Quality Management', description: '품질관리' },
  { id: 'TR', name: 'Treasury', description: '자금관리' },
  { id: 'HR', name: 'Human Resource', description: '인사관리' },
]

// SAP benefits
const sapBenefits = [
  {
    title: '비용 절감과 환경적 이점',
    points: [
      '자원 효율성 향상과 경제적으로 효과적인 모범 사례',
      '비용 효율적인 IT 환경',
      '운영비 절감 가능',
    ],
    icon: 'https://ext.same-assets.com/1397033195/150488707.png',
  },
  {
    title: '생산성이 개선과 향상',
    points: [
      '실시간 시스템 관리로 직원들의 역량을 강화해 조직이 지속적으로 발전할 수 있게 해줍니다.',
    ],
    icon: 'https://ext.same-assets.com/1397033195/3488559407.png',
  },
  {
    title: '부서 차원에서 전체 프로세스로',
    points: [
      'Data 활용의 Real Time 구현',
      '데이터베이스 Data 단일화 처리',
      '타 시스템 연계와 연동 업무 최적화',
      'E-Business와 연계',
    ],
    icon: 'https://ext.same-assets.com/1397033195/828377398.png',
  },
  {
    title: '기업의 글로벌적 지원',
    points: [
      '다국어, 다양한 통화의 지원으로',
      '글로벌화를 위한 다양한 사례들 제공',
      '프로세스 표준화 : 국제화된 기업 프로세스',
      '가용한 솔루션들 : 각 국가들의 법적 요구사항과 회계기준',
    ],
    icon: 'https://ext.same-assets.com/1397033195/1663509900.png',
  },
]

// Implementation steps
const implementationSteps = [
  {
    number: 1,
    title: 'Top 경영 참여 가능 필름 및 범위 정의',
    description: '기업의 장기적인 성공 동력이 될 수 있도록 명확한 비전과 혁신에 대한 공감대 도출',
  },
  {
    number: 2,
    title: '현장의 Risk에서 변화 전략의 채택',
    description: '안정적/효율적 변화를 위한 철저한 준비와 함께 지속적 모니터링 (프로젝트 거버넌스 체계)',
  },
  {
    number: 3,
    title: '신속한 개발 및 시범 구현',
    description: '가장 중요한 기능에 대한 신속한 개발 및 시험(Prototyping)/선행구현에 집중하여 프로젝트 초기부터 정량적/정성적 성과 달성',
  },
  {
    number: 4,
    title: '평생/유지 변화 및 관리',
    description: 'ERP 구축 시점부터 지속적으로 변화관리가 필요하며 사내/외 모든 이해관계자 지원',
  },
  {
    number: 5,
    title: '제품 수명주기에 맞춘 혁신하기',
    description: '안정적/이해관계자 활용 목표를 우선적으로 달성하고 이해관계자 만족도 향상 (지속적 개선 체계)',
  },
]

export default function SAPPage() {
  return (
    <div>
      {/* Hero Banner */}
      <div
        className="bg-echoit-bgDark text-white py-16"
        style={{
          backgroundImage: 'linear-gradient(rgba(14, 67, 118, 0.8), rgba(14, 67, 118, 0.8)), url(https://ext.same-assets.com/1397033195/2509476503.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="echoit-container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[Raleway]">
            SAP ERP
          </h1>
          <p className="text-gray-300 max-w-2xl">
            근본적인 경영 혁신을 위한 SAP
          </p>
        </div>
      </div>

      {/* SAP Overview */}
      <section className="py-16 bg-white">
        <div className="echoit-container">
          <h2 className="section-title">SAP ERP는 모든 비즈니스의 요구사항을 충족합니다.</h2>
          <div className="section-divider"></div>

          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            SAP는 기업의 재무, 인사, 구매, 생산, 물류, 재고 등 모든 업무를 하나의 시스템에서 관리하는 기업자원관리 시스템입니다. 기업들은 경영이 복잡해질수록 의사결정의 어려움이 증가합니다. 시스템 통합을 통해 모든 업무가 유기적으로 연결됩니다.
          </p>

          {/* SAP Modules */}
          <div className="bg-echoit-secondary text-white p-8 rounded-lg mb-16">
            <h3 className="text-xl font-bold mb-6 text-center">SAP ERP 모듈구성</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sapModules.map((module) => (
                <div key={module.id} className="flex items-center">
                  <div className="font-bold text-lg mr-3 w-10">{module.id}</div>
                  <div>
                    <div className="text-sm">{module.name}</div>
                    <div className="text-gray-300 text-xs">{module.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SAP Services */}
          <div className="bg-blue-50 p-8 rounded-lg mb-16">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 mb-6 md:mb-0 md:pr-8">
                <h3 className="text-xl font-bold mb-4">SAP ERP는 에코아이티의 성장의 근간입니다.</h3>
                <p className="text-gray-600 mb-4">
                  SAP ERP 구축, 운영 전문 기업으로서 <span className="font-bold">최상의 서비스를</span> 제공합니다.
                </p>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-3">에코아이티는</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">SAP Business Suite 및 S/4HANA Platform</span> 기반 시스템의 컨설팅,
                    시스템 개발, 서비스 구축/마이그레이션/업그레이드/튜닝/오픈,
                    유지보수 서비스를 제공합니다.
                  </p>
                </div>
              </div>
              <div className="md:w-3/5">
                <div className="bg-white p-6 rounded-lg border border-gray-200 h-full flex flex-col justify-center items-center">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg">ECHOIT SAP ERP</h3>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                    <div className="flex items-center space-x-2 bg-blue-100 p-3 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v8" />
                          <path d="M8 12h8" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">ERP 컨설팅</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-blue-100 p-3 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">PI 연동</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-blue-100 p-3 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                          <path d="M10 9H8" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">ABAP 개발</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-blue-100 p-3 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">업글 대응</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why SAP ERP */}
      <section className="py-16 bg-gray-50">
        <div className="echoit-container">
          <h2 className="section-title">WHY SAP ERP</h2>
          <div className="section-divider"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {sapBenefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
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

          <h2 className="section-title">SAP ERP 기대효과</h2>
          <div className="section-divider"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {implementationSteps.slice(0, 3).map((step) => (
              <div
                key={step.number}
                className="relative overflow-hidden rounded-lg"
                style={{
                  backgroundColor: step.number === 1
                    ? '#333'
                    : step.number === 2
                      ? '#0e4376'
                      : '#1199ff',
                  color: 'white'
                }}
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="text-4xl font-bold mb-4">{step.number}</div>
                  <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                  <p className="text-sm opacity-90 mt-auto">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {implementationSteps.slice(3).map((step) => (
              <div
                key={step.number}
                className="bg-white border border-gray-200 p-6 rounded-lg"
              >
                <div className="flex items-start">
                  <div className="text-3xl font-bold text-echoit-primary mr-4">{step.number}</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-echoit-primary text-white">
        <div className="echoit-container text-center">
          <h2 className="text-3xl font-bold mb-6">에코아이티와 함께 SAP ERP 도입을 시작하세요</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            SAP 구축 경험이 풍부한 에코아이티는 고객의 니즈에 맞는 최적의 솔루션을 제공합니다.
            지금 문의하시고 비즈니스 혁신을 경험하세요.
          </p>
          <Link
            href="/company/contact"
            className="bg-white text-echoit-primary font-medium py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors inline-block"
          >
            문의하기
          </Link>
        </div>
      </section>
    </div>
  )
}
