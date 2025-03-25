'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/language-context'

export function ContactSection() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const { t } = useLanguage()

  // Categories with translations
  const categories = [
    { value: 'individual', label: t('contact.individual') },
    { value: 'company', label: t('contact.company') },
    { value: 'partner', label: t('contact.partner') },
    { value: 'collaboration', label: t('contact.collaboration') },
    { value: 'other', label: t('contact.other') },
  ]

  // Services
  const services = [
    { value: 'sap', label: 'SAP' },
    { value: 'ai-rpa', label: 'AI/RPA' },
    { value: 'mendix', label: 'Mendix' },
    { value: 'hancom', label: '한컴AI' },
    { value: 'salesforce', label: 'Salesforce' },
    { value: 'ito', label: 'ITO(SI/SM)' },
  ]

  const toggleCategory = (value: string) => {
    if (selectedCategories.includes(value)) {
      setSelectedCategories(selectedCategories.filter(item => item !== value))
    } else {
      setSelectedCategories([...selectedCategories, value])
    }
  }

  const toggleService = (value: string) => {
    if (selectedServices.includes(value)) {
      setSelectedServices(selectedServices.filter(item => item !== value))
    } else {
      setSelectedServices([...selectedServices, value])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would send the form data to a server
    alert('문의가 접수되었습니다. 곧 연락 드리겠습니다.')
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="echoit-container">
        <h2 className="section-title">{t('contact.title')}</h2>
        <div className="section-divider"></div>

        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          {t('contact.subtitle')}
        </p>

        <div className="max-w-3xl mx-auto bg-white rounded-md shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Inquiry Category */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                <span className="text-red-500 mr-1">*</span> {t('contact.inquiry')}
              </label>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <label
                    key={category.value}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                    />
                    <div
                      className={cn(
                        "px-3 py-1 text-sm rounded border transition-colors",
                        selectedCategories.includes(category.value)
                          ? "bg-echoit-primary text-white border-echoit-primary"
                          : "bg-white text-gray-700 border-gray-300"
                      )}
                    >
                      {category.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t('contact.field')}
              </label>
              <div className="flex flex-wrap gap-3">
                {services.map((service) => (
                  <label
                    key={service.value}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedServices.includes(service.value)}
                      onChange={() => toggleService(service.value)}
                    />
                    <div
                      className={cn(
                        "px-3 py-1 text-sm rounded border transition-colors",
                        selectedServices.includes(service.value)
                          ? "bg-echoit-primary text-white border-echoit-primary"
                          : "bg-white text-gray-700 border-gray-300"
                      )}
                    >
                      {service.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name and Company in two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="text-red-500 mr-1">*</span> {t('contact.name')}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-echoit-primary focus:border-echoit-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  {t('contact.company')}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-echoit-primary focus:border-echoit-primary"
                />
              </div>
            </div>

            {/* Email and Phone in two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="text-red-500 mr-1">*</span> {t('contact.email')}
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-echoit-primary focus:border-echoit-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="text-red-500 mr-1">*</span> {t('contact.phone')}
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-echoit-primary focus:border-echoit-primary"
                  required
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {t('contact.message')}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-echoit-primary focus:border-echoit-primary h-32"
              ></textarea>
            </div>

            {/* Privacy Policy */}
            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input type="checkbox" className="mt-1 mr-2" required />
                <p className="text-xs text-gray-500">
                  {t('contact.privacy')}
                </p>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-echoit-primary hover:bg-opacity-90 text-white font-medium py-2 px-8 rounded transition-colors"
              >
                {t('contact.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
