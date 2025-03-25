'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { NewsCard } from '@/components/news/news-card'
import {
  getFeaturedNewsPosts,
  getNewsPostsByCategory,
  getRecentNewsPosts,
  searchNewsPosts
} from '@/lib/models/news-posts'

export default function NewsPage() {
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // Get posts based on active filter and search
  const getPosts = () => {
    if (searchQuery.trim()) {
      return searchNewsPosts(searchQuery, language as 'ko' | 'en')
    }

    if (activeCategory === 'all') {
      return getRecentNewsPosts(50) // Get all recent posts
    }

    return getNewsPostsByCategory(activeCategory)
  }

  const featuredPosts = getFeaturedNewsPosts()
  const filteredPosts = getPosts()

  // Categories for filter
  const categories = [
    { id: 'all', name: { ko: '전체', en: 'All' } },
    { id: 'company', name: { ko: '회사소식', en: 'Company' } },
    { id: 'award', name: { ko: '수상소식', en: 'Award' } },
    { id: 'partnership', name: { ko: '파트너십', en: 'Partnership' } },
    { id: 'product', name: { ko: '제품소식', en: 'Product' } },
  ]

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-echoit-bgDark text-white py-16">
        <div className="echoit-container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[Raleway]">
            {language === 'ko' ? '뉴스 & 소식' : 'News & Updates'}
          </h1>
          <p className="text-gray-300 max-w-2xl">
            {language === 'ko'
              ? '에코아이티의 최신 소식과 업데이트를 확인하세요.'
              : 'Check the latest news and updates from Echo IT.'}
          </p>
        </div>
      </div>

      {/* Featured News Section */}
      {featuredPosts.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="echoit-container">
            <h2 className="text-2xl font-bold mb-8">
              {language === 'ko' ? '주요 소식' : 'Featured News'}
            </h2>

            <div className="grid grid-cols-1 gap-8">
              {featuredPosts.slice(0, 1).map(post => (
                <NewsCard key={post.id} post={post} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All News Section */}
      <section className="py-16">
        <div className="echoit-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold">
              {language === 'ko' ? '모든 소식' : 'All News'}
            </h2>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder={language === 'ko' ? '검색...' : 'Search...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-echoit-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-echoit-primary text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name[language]}
              </button>
            ))}
          </div>

          {/* News Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {language === 'ko'
                  ? '검색 결과가 없습니다.'
                  : 'No results found.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
