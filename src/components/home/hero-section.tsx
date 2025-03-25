'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/language-context'

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { t } = useLanguage()

  // Generate slides with translations
  const slides = [
    {
      id: 1,
      title: t('hero.title'),
      description: t('hero.description'),
      bgImage: 'https://ext.same-assets.com/1397033195/673071421.png',
      links: [
        { text: 'SAP ERP', href: '/business/sap' },
        { text: 'Brity Automation', href: '/business/ai-rpa' },
        { text: 'Mendix', href: '/business/mendix' },
        { text: 'AI', href: '/business/ai' },
      ]
    },
    {
      id: 2,
      title: t('hero.title2'),
      description: t('hero.description2'),
      bgImage: 'https://ext.same-assets.com/1397033195/3619132094.png',
      links: []
    }
  ]

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <section className="relative bg-echoit-bgDark text-white overflow-hidden">
      {/* Slides */}
      <div className="relative h-[80vh] md:h-[60vh] min-h-[500px] w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
            style={{
              backgroundImage: `linear-gradient(rgba(30, 49, 64, 0.7), rgba(30, 49, 64, 0.7)), url(${slide.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="echoit-container h-full flex flex-col justify-center items-start">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[Raleway]">
                {slide.title}
              </h1>
              <p className="text-sm md:text-base text-gray-300 mb-8 max-w-2xl">
                {slide.description}
              </p>

              {/* Service Links - only shown on first slide */}
              {slide.links.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                  {slide.links.map((link) => (
                    <Link
                      href={link.href}
                      key={link.text}
                      className="bg-black bg-opacity-50 hover:bg-echoit-primary p-4 rounded transition-colors text-center"
                    >
                      <span className="block text-sm font-medium">{link.text}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              index === currentSlide
                ? "bg-echoit-primary w-6"
                : "bg-white bg-opacity-50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 right-10 z-20 hidden md:block">
        <button
          className="text-white text-xs flex flex-col items-center animate-bounce"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth'
            })
          }}
        >
          <span className="mb-1">{t('hero.scroll')}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
