'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { NewsCard } from '@/components/news/news-card'
import { NewsCategory } from '@/types/news'
import { 
  getNewsPostsByCategory,
  searchNewsPosts 
} from '@/lib/services/posts'

interface NewsPageClientProps {
  initialPosts: any[];
  featuredPosts: any[];
}

export default function NewsPageClient({ initialPosts, featuredPosts }: NewsPageClientProps) {
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [filteredPosts, setFilteredPosts] = useState<any[]>(initialPosts)
  const [loading, setLoading] = useState(false)

  // 카테고리 변경 시 데이터 가져오기
  useEffect(() => {
    async function fetchFilteredData() {
      if (searchQuery.trim()) return // 검색 중이면 무시

      setLoading(true)
      try {
        let posts
        if (activeCategory === 'all') {
          // 초기 데이터를 재사용하거나 새로 가져올 수 있음
          const response = await fetch('/api/posts/news?limit=50');
          const data = await response.json();
          posts = data.posts;
        } else {
          posts = await getNewsPostsByCategory(activeCategory)
        }
        setFilteredPosts(posts)
      } catch (error) {
        console.error('카테고리별 뉴스 데이터 로딩 중 오류 발생:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilteredData()
  }, [activeCategory])

  // 검색어 변경 시 데이터 가져오기
  useEffect(() => {
    async function searchData() {
      if (!searchQuery.trim()) {
        // 검색어가 없으면 초기 상태로 복원
        setFilteredPosts(initialPosts)
        return
      }

      setLoading(true)
      try {
        // API 라우트를 통해 검색 요청
        const response = await fetch(`/api/posts/news/search?keyword=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setFilteredPosts(data.posts || []);
      } catch (error) {
        console.error('뉴스 검색 중 오류 발생:', error)
      } finally {
        setLoading(false)
      }
    }

    // 검색어 입력 후 300ms 후에 검색 실행 (타이핑 중에는 API 호출 방지)
    const debounce = setTimeout(() => {
      searchData()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery, initialPosts])

  // Categories for filter
  const categories = [
    { id: 'all', name: { ko: '전체', en: 'All' } },
    { id: NewsCategory.COMPANY, name: { ko: '회사소식', en: 'Company' } },
    { id: NewsCategory.AWARD, name: { ko: '수상소식', en: 'Award' } },
    { id: NewsCategory.MEDIA, name: { ko: '미디어', en: 'Media' } },
    { id: NewsCategory.PRODUCT, name: { ko: '제품소식', en: 'Product' } },
    { id: NewsCategory.EVENT, name: { ko: '이벤트', en: 'Event' } },
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
              : 'Check the latest news and updates from ECHOIT.'}
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
              {featuredPosts.map(post => (
                <NewsCard key={post._id?.toString() || post.id} post={post} variant="featured" />
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {language === 'ko' ? '데이터를 불러오는 중입니다...' : 'Loading data...'}
              </p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <NewsCard key={post._id?.toString() || post.id} post={post} />
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