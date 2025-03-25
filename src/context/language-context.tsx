'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ko'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionaries
const translations = {
  en: {
    // Header
    'menu.business': 'Business',
    'menu.notice': 'Notice',
    'menu.recruit': 'Recruit',
    'menu.company': 'Company',
    'menu.contact': 'Contact Us',

    // Home page
    'hero.title': 'Together with You',
    'hero.description': 'Echo IT provides Total IT services through the latest ICT technologies and expert groups. Future-oriented DX technology for customers, partnerships, and business growth.',
    'hero.title2': 'All Technologies for Smart DX',
    'hero.description2': 'We provide the future of digital innovation powered by AI through SAP, AI/RPA, Low-Code, CRM & ITO.',
    'hero.scroll': 'SCROLL',

    'technologies.title': 'All Technologies for Smart DX',
    'technologies.subtitle': 'We provide the future of digital innovation powered by AI through SAP, AI/RPA, Low-Code, CRM & ITO.',
    'technologies.more': 'More',

    'core.title': 'Core Values',
    'core.subtitle': '"Creative thinking, strong execution" is the future of Echo IT. Echo IT values will grow as we continue to drive change, collaboration, innovation, knowledge management, and customer satisfaction.',

    'customers.title': 'Customers',
    'customers.subtitle': 'Echo IT successfully provides implementation and maintenance services to customers in various fields such as major corporations, startups, and public institutions.',

    'contact.title': 'Contact Us',
    'contact.subtitle': 'Please fill out the form below and we will get back to you as soon as possible.',
    'contact.inquiry': 'Inquiry Type',
    'contact.individual': 'Individual',
    'contact.company': 'Company',
    'contact.partner': 'Partner',
    'contact.collaboration': 'Collaboration',
    'contact.other': 'Other',
    'contact.field': 'Field',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.message': 'Message',
    'contact.submit': 'Submit',
    'contact.privacy': '* Required fields must be filled in. Echo IT values your personal information and complies with the laws regarding promotion of information and protection of information. Your personal information will not be disclosed without your prior consent.',

    // Footer
    'footer.sitemap': 'SITEMAP',
    'footer.newsletter': 'Newsletter',
    'footer.brochure': 'Company Brochure',
    'footer.location': 'Location',
    'footer.employee': 'Employee Site',
    'footer.privacy': 'Privacy Policy',
    'footer.copyright': 'Copyright ⓒ Echo Information Technology Co., LTD All Right Reserved.',

    // Business page
    'business.title': 'Business',
    'business.subtitle': 'Echo IT\'s business services provide various solutions for corporate digital transformation.',
    'business.details': 'Details',
  },
  ko: {
    // Header
    'menu.business': '비즈니스',
    'menu.notice': '공지사항',
    'menu.recruit': '채용',
    'menu.company': '회사소개',
    'menu.contact': '문의하기',

    // Home page
    'hero.title': 'Together with You',
    'hero.description': '에코아이티는 최신 ICT 기술과 전문가 집단을 통한 Total IT 서비스를 제공합니다. 미래를 위한 DX 기술로 고객과 파트너십스, 기업의 성장을.',
    'hero.title2': 'All Technologies for Smart DX',
    'hero.description2': 'SAP, AI/RPA, Low-Code, CRM & ITO를 통해 AI 동력으로 구현된 디지털 혁신의 미래를 제공합니다.',
    'hero.scroll': '스크롤',

    'technologies.title': 'All Technologies for Smart DX',
    'technologies.subtitle': 'SAP, AI/RPA, Low-Code, CRM & ITO를 통해 AI 동력으로 구현된 디지털 혁신의 미래를 제공합니다.',
    'technologies.more': '더보기',

    'core.title': '핵심 가치',
    'core.subtitle': '"기업은 창의적 발상, 실천력 강한 실행력"으로 새로운 에코아이티의 미래입니다. 에코아이티는 모든 변화, 협력의, 반드시 혁신적이어야 하는 지식경영과 고객을 만족을 거듭하다보면 에코아이티의 가치를 더욱 높일 것으로 생각합니다.',

    'customers.title': '고객사',
    'customers.subtitle': '에코아이티는 대기업, 스타트업, 공공기관 등 다양한 분야의 고객사에게 구축 및 유지보수 서비스를 성공적으로 수행하고 있습니다.',

    'contact.title': '문의하기',
    'contact.subtitle': '아래 양식을 작성해 메일로 문의 주시면 빠르게 답변 드리겠습니다.',
    'contact.inquiry': '문의유형',
    'contact.individual': '개인문의',
    'contact.company': '기업',
    'contact.partner': '파트너',
    'contact.collaboration': '협업',
    'contact.other': '기타',
    'contact.field': '분야',
    'contact.name': '이름',
    'contact.email': '이메일',
    'contact.phone': '연락처',
    'contact.message': '문의내용',
    'contact.submit': '등록',
    'contact.privacy': '* 필수항목은 필수입니다. (주)에코아이티는 이용자의 개인정보를 매우 중요시 하며 정보통신망 이용촉진 및 정보보호에 관한 법률을 준수하고 있습니다. 이용자의 사전 동의 없이 이용자의 개인 정보를 함부로 공개하지 않으며, 수집된 정보는 아래와 같이 이용하고 있습니다.',

    // Footer
    'footer.sitemap': '사이트맵',
    'footer.newsletter': '뉴스레터 신청',
    'footer.brochure': '회사소개서',
    'footer.location': '회사위치',
    'footer.employee': '직원전용 사이트',
    'footer.privacy': '개인정보 처리방침',
    'footer.copyright': 'Copyright ⓒ Echo Information Technology Co., LTD All Right Reserved.',

    // Business page
    'business.title': '비즈니스',
    'business.subtitle': '에코아이티의 비즈니스 서비스는 기업의 디지털 전환을 위한 다양한 솔루션을 제공합니다.',
    'business.details': '자세히 보기',
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ko')

  // Load language preference from localStorage when available
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ko')) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}
