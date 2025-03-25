'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook } from 'lucide-react'
import { useLanguage } from '@/context/language-context'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-echoit-bgDark text-white">
      {/* Footer Links (Site Map) - Hidden on mobile */}
      <div className="hidden md:block bg-[#181f25] py-4">
        <div className="echoit-container">
          <h3 className="text-sm font-medium mb-2">{t('footer.sitemap')}</h3>
          <div className="grid grid-cols-4 gap-4">
            {/* Business */}
            <div>
              <h4 className="text-sm mb-2">{t('menu.business')}</h4>
              <ul className="space-y-1 text-xs text-gray-400">
                <li><Link href="/business/sap" className="hover:text-echoit-primary">SAP</Link></li>
                <li><Link href="/business/ai-rpa" className="hover:text-echoit-primary">AI/RPA</Link></li>
                <li><Link href="/business/mendix" className="hover:text-echoit-primary">Mendix</Link></li>
                <li><Link href="/business/ai" className="hover:text-echoit-primary">AI</Link></li>
                <li><Link href="/business/salesforce" className="hover:text-echoit-primary">Salesforce</Link></li>
                <li><Link href="/business/ito" className="hover:text-echoit-primary">ITO(SI/SM)</Link></li>
              </ul>
            </div>

            {/* Notice */}
            <div>
              <h4 className="text-sm mb-2">{t('menu.notice')}</h4>
              <ul className="space-y-1 text-xs text-gray-400">
                <li><Link href="/notice/esg" className="hover:text-echoit-primary">ESG</Link></li>
                <li><Link href="/notice/news" className="hover:text-echoit-primary">News</Link></li>
                <li><Link href="/notice/customer" className="hover:text-echoit-primary">Customer</Link></li>
              </ul>
            </div>

            {/* Recruit */}
            <div>
              <h4 className="text-sm mb-2">{t('menu.recruit')}</h4>
              <ul className="space-y-1 text-xs text-gray-400">
                <li><Link href="/recruit/talent" className="hover:text-echoit-primary">Talent</Link></li>
                <li><Link href="/recruit/benefits" className="hover:text-echoit-primary">Benefits</Link></li>
                <li><Link href="/recruit/jobs" className="hover:text-echoit-primary">Jobs</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm mb-2">{t('menu.company')}</h4>
              <ul className="space-y-1 text-xs text-gray-400">
                <li><Link href="/company/about" className="hover:text-echoit-primary">About</Link></li>
                <li><Link href="/company/partners" className="hover:text-echoit-primary">Partners</Link></li>
                <li><Link href="/company/history" className="hover:text-echoit-primary">History</Link></li>
                <li><Link href="/company/contact" className="hover:text-echoit-primary">{t('menu.contact')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Row */}
      <div className="border-t border-gray-700 py-3 text-xs">
        <div className="echoit-container flex flex-wrap justify-center md:justify-end gap-4">
          <Link href="https://page.stibee.com/subscriptions/45645" className="text-white hover:text-echoit-primary">
            {t('footer.newsletter')}
          </Link>
          <Link href="/pdf/_202503.pdf" className="text-white hover:text-echoit-primary">
            {t('footer.brochure')}
          </Link>
          <Link href="/notice/esg" className="text-white hover:text-echoit-primary">ESG</Link>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="border-t border-gray-700 py-3">
        <div className="echoit-container flex justify-center md:justify-end gap-3">
          <Link href="https://www.facebook.com/echoit.co.kr" aria-label="Facebook" className="bg-gray-800 rounded-full p-1.5 hover:bg-echoit-primary">
            <Facebook size={18} />
          </Link>
          <Link href="https://blog.naver.com/echoit2008" aria-label="Blog" className="bg-gray-800 rounded-full p-1.5 hover:bg-echoit-primary">
            <span className="text-sm font-bold">B</span>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-700 py-4">
        <div className="echoit-container">
          {/* Company Info */}
          <p className="text-xs text-gray-400 mb-4 text-center md:text-left">
            서울특별시 강남구 강남대로146길 25(논현동) 4층 TEL 02-6342-8021 FAX 02-864-8021
          </p>

          {/* Links */}
          <div className="flex justify-center md:justify-start items-center text-xs text-gray-400 space-x-2 mb-4">
            <Link href="http://www.echoit.co.kr/rest/index.html" className="hover:text-white">
              {t('footer.location')}
            </Link>
            <span>|</span>
            <Link href="https://echoit.daouoffice.com" className="hover:text-white">
              {t('footer.employee')}
            </Link>
            <span>|</span>
            <Link href="http://www.echoit.co.kr/common/company-personal_info.html" className="hover:text-white">
              {t('footer.privacy')}
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center md:text-left">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
