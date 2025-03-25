'use client'

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'

const coreValues = [
  {
    letter: 'C',
    title: 'Customer satisfaction',
    description: '고객의 환경과 요구를 정확히 분석하여 최적화된 것',
    number: '01',
    bgColor: 'bg-blue-100',
  },
  {
    letter: 'H',
    title: 'Human Resources-oriented',
    description: '에코아이티의 핵심 자산은 우수한 인재',
    number: '02',
    bgColor: 'bg-teal-100',
  },
  {
    letter: 'A',
    title: 'Challenge & Action',
    description: '에코아이티는 항상 기술적으로 도전',
    number: '03',
    bgColor: 'bg-green-100',
  },
  {
    letter: 'E',
    title: 'Expertise & Know-how',
    description: '축적된 전문성과 노하우, 정확한 의사소통 역량',
    number: '04',
    bgColor: 'bg-blue-100',
  },
]

export function CoreValuesSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 bg-white">
      <div className="echoit-container">
        <h2 className="section-title">{t('core.title')}</h2>
        <div className="section-divider"></div>

        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          {t('core.subtitle')}
        </p>

        {/* Core Values Diagram - For Desktop */}
        <div className="hidden md:flex justify-center mb-12">
          <div className="relative w-[500px] h-[500px]">
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-echoit-primary rounded-full w-32 h-32 flex items-center justify-center text-white text-center">
              <div>
                <div className="text-xs mb-1">에코아이티</div>
                <div className="font-bold">핵심가치</div>
              </div>
            </div>

            {/* Four Value Circles */}
            {coreValues.map((value, index) => {
              // Calculate position based on index (0, 1, 2, 3)
              // This will position items in a circle around the center
              const angle = (index * Math.PI / 2) + (Math.PI / 4); // Divide the circle into 4 parts
              const radius = 180; // Distance from center
              const top = `calc(50% + ${Math.sin(angle) * radius}px - 50px)`;
              const left = `calc(50% + ${Math.cos(angle) * radius}px - 50px)`;

              return (
                <div
                  key={value.letter}
                  className="absolute w-[100px] h-[100px] flex flex-col items-center justify-center bg-echoit-primary rounded-full text-white text-center"
                  style={{ top, left }}
                >
                  <div className="text-2xl font-bold">{value.letter}</div>
                  <div className="text-[10px] opacity-80">{value.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Values List - For Mobile and as alternative on Desktop */}
        <div className="grid md:grid-cols-4 gap-6">
          {coreValues.map((value) => (
            <div key={value.letter} className="bg-gray-50 rounded-md p-6 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-echoit-primary rounded-full flex items-center justify-center text-white mr-3">
                  <span className="font-bold">{value.letter}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{value.number}</h3>
                </div>
              </div>
              <h4 className="font-bold mb-2 text-echoit-text">{value.title}</h4>
              <p className="text-sm text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
