'use client'

import React from 'react'
import { ContactSection } from '@/components/home/contact-section'

export default function ContactPage() {
  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-echoit-bgDark text-white py-16">
        <div className="echoit-container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[Raleway]">
            Contact Us
          </h1>
          <p className="text-gray-300 max-w-2xl">
            성장 비즈니스 파트너, 에코아이티
          </p>
        </div>
      </div>

      {/* Office Location */}
      <section className="py-16 bg-white">
        <div className="echoit-container">
          <h2 className="section-title">오시는 길</h2>
          <div className="section-divider"></div>

          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            성공 비즈니스 파트너 에코아이티로 오시는 길을 안내해드립니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">에코아이티 본사</h3>
              <p className="mb-2">서울특별시 강남구 강남대로146길 25(논현동) 4층</p>
              <p className="mb-4">T. 02-6342-8021 / F. 02-864-8021</p>

              <div className="bg-gray-200 rounded-lg h-80 w-full flex items-center justify-center">
                {/* In a real implementation, this would be a Google Map or Kakao Map */}
                <p className="text-gray-500">지도가 표시됩니다</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">가까운 지하철</h3>
              <p className="mb-6">3호선, 신분당선 신사역1, 2, 3번 출구</p>

              <h4 className="font-bold mb-2">교통편 안내</h4>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>지하철: 3호선, 신분당선 신사역 하차</li>
                <li>버스: 강남대로 주변 버스 정류장 하차</li>
              </ul>

              <h4 className="font-bold mb-2">주차안내</h4>
              <p>건물 내 주차 가능 (주차비용 발생)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactSection />
    </div>
  )
}
