'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Company timeline data
const timeline = [
  {
    period: '2008 ~ 2017',
    title: 'Beginning',
    phase: '1.0',
    events: [
      { year: '2008', description: '(주)에코아이티 설립, 공공분야 G-ERP 구축' },
      { year: '2009', description: '(주)케이티 네트웍스 프로젝트 수행' },
      { year: '2011', description: '코오롱베니트 프로젝트 참여, LG CNS 협력사 등록' },
      { year: '2012', description: '한국항공우주산업 IDT 프로젝트 수행' },
      { year: '2013', description: '(주)두산그룹 프로젝트 참여, SK C&C Biz.파트너 등록' },
      { year: '2015', description: '삼성전자 4Star 획득' },
      { year: '2016', description: '한국전력공사 프로젝트 참여' },
      { year: '2017', description: 'KT ds 협력사 등록, CJ제일제당 프로젝트 참여' },
    ]
  },
  {
    period: '2018 ~ 2022',
    title: 'Growth',
    phase: '2.0',
    events: [
      { year: '2018', description: '한국항공우주산업 프로젝트 참여, RPA 사업 개시' },
      { year: '2019', description: '경영혁신형 중소기업(Main-Biz) 인증, 대한민국 굿컴퍼니 대상 수상' },
      { year: '2020', description: '삼성SDS Brity RPA 파트너십, 삼성SDS 파트너 등록' },
      { year: '2021', description: '경기도경제과학진흥원 선정, 중소벤처기업부 기술혁신형 인증' },
      { year: '2022', description: '벤처기업 인증, 경영혁신형 중소기업 갱신, 한화시스템 SDS 파트너십' },
    ]
  },
  {
    period: '2023 ~ ',
    title: 'Value',
    phase: '3.0',
    events: [
      { year: '2023', description: 'ESG 경영 선포, Siemens Mendix 파트너십, GSITM 파트너십' },
      { year: '2024', description: '한국한컴그룹 파트너십 체결, 에코아이티 제2의 도약' },
    ]
  }
]

export default function CompanyPage() {
  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-echoit-bgDark text-white py-16">
        <div className="echoit-container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[Raleway]">
            About Company
          </h1>
          <p className="text-gray-300 max-w-2xl">
            에코아이티는 혁신, 성실, 정직함을 추구합니다.
          </p>
        </div>
      </div>

      {/* Company Overview */}
      <section className="py-16 bg-white">
        <div className="echoit-container">
          <h2 className="section-title">All Technologies for Smart DX</h2>
          <div className="section-divider"></div>

          <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-4 rounded-md mb-10">
            <div className="text-sm md:text-base text-gray-700 mb-4 md:mb-0">
              <strong>SAP, AI/RPA, Low-Code, CRM & ITO</strong>를 통해 AI 동력으로 구현된 디지털 혁신의 미래를 제공합니다.
            </div>
          </div>

          {/* Company Info Card */}
          <div className="bg-gray-50 p-8 rounded-lg mb-16">
            <div className="flex flex-col md:flex-row items-center mb-8">
              <Image
                src="https://ext.same-assets.com/1397033195/831049508.png"
                alt="ECHOIT"
                width={200}
                height={50}
                className="mb-6 md:mb-0 md:mr-12"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="text-gray-500 w-24 flex-shrink-0">회사명</span>
                  <span className="font-medium">(주) 에코아이티</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 w-24 flex-shrink-0">대표이사</span>
                  <span className="font-medium">홍길동</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 w-24 flex-shrink-0">연락처</span>
                  <span className="font-medium">T. 02-6342-8021 / F.02-864-8021</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 w-24 flex-shrink-0">주소</span>
                  <span className="font-medium">서울특별시 강남구 강남대로146길 25(논현동) 4층</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 w-24 flex-shrink-0">웹사이트</span>
                  <span className="font-medium">https://www.echoit.co.kr</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 w-24 flex-shrink-0">설립일</span>
                  <span className="font-medium">2008년 6월</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-md text-center">
                <h4 className="text-sm font-medium mb-2">SAP ERP</h4>
                <p className="text-xs text-gray-500">비즈니스 프로세스 최적화</p>
              </div>
              <div className="bg-white p-4 rounded-md text-center">
                <h4 className="text-sm font-medium mb-2">AI/RPA</h4>
                <p className="text-xs text-gray-500">업무 자동화 솔루션</p>
              </div>
              <div className="bg-white p-4 rounded-md text-center">
                <h4 className="text-sm font-medium mb-2">Low-Code</h4>
                <p className="text-xs text-gray-500">앱 개발 플랫폼</p>
              </div>
              <div className="bg-white p-4 rounded-md text-center">
                <h4 className="text-sm font-medium mb-2">ITO</h4>
                <p className="text-xs text-gray-500">시스템 통합 및 유지보수</p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            <strong>안정적이고, 혁신적이며, 신뢰할 수 있는</strong> 파트너 에코아이티는 다양한 IT 솔루션을 제공하는 기술 전문 기업으로,
            IT 서비스 및 솔루션을 통해 고객의 비즈니스 혁신을 지원합니다.
          </p>
        </div>
      </section>

      {/* Company History */}
      <section className="py-16 bg-gray-50">
        <div className="echoit-container">
          <h2 className="section-title">History</h2>
          <div className="section-divider"></div>

          <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
            {timeline.map((phase) => (
              <div key={phase.phase} className="bg-white p-6 rounded-lg shadow-sm flex-1 max-w-md">
                <div className="text-echoit-primary text-sm font-bold mb-2">
                  {phase.phase} {phase.title}
                </div>
                <div className="text-xl font-bold mb-4">
                  {phase.period}
                </div>
                <p className="text-gray-600 text-sm">
                  에코아이티의 {phase.title.toLowerCase()} 단계
                </p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {timeline.map((phase) => (
              <div key={phase.phase} className="mb-12">
                <h3 className="text-xl font-bold mb-6 bg-echoit-bgDark text-white inline-block px-4 py-2 rounded">
                  {phase.period} - {phase.title}
                </h3>

                <div className="space-y-4">
                  {phase.events.map((event) => (
                    <div
                      key={event.year}
                      className="flex border-l-4 border-echoit-primary pl-4 ml-4"
                    >
                      <div className="text-echoit-primary font-bold w-16">{event.year}</div>
                      <div className="flex-1">{event.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/company/contact"
              className="bg-echoit-primary hover:bg-opacity-90 text-white font-medium py-3 px-8 rounded transition-colors"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
