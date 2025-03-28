'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { ESGCard } from '@/components/news/esg-card'
import { ESGCategory } from '@/types/esg'
import { 
  getESGPostsByCategory
} from '@/lib/services/posts'

interface ESGPageClientProps {
  initialPosts: any[];
  recentPosts: any[];
}

export default function ESGPageClient({ initialPosts = [], recentPosts = [] }: ESGPageClientProps) {
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [filteredPosts, setFilteredPosts] = useState<any[]>(initialPosts || [])
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
          try {
            const response = await fetch('/api/posts/esg?limit=50');
            const data = await response.json();
            posts = data.posts || [];
          } catch (error) {
            console.error('ESG 게시물 가져오기 오류:', error);
            posts = initialPosts || [];
          }
        } else {
          try {
            posts = await getESGPostsByCategory(activeCategory) || [];
          } catch (error) {
            console.error('카테고리별 ESG 게시물 가져오기 오류:', error);
            posts = [];
          }
        }
        setFilteredPosts(posts)
      } catch (error) {
        console.error('카테고리별 ESG 데이터 로딩 중 오류 발생:', error)
        setFilteredPosts(initialPosts || [])
      } finally {
        setLoading(false)
      }
    }

    fetchFilteredData()
  }, [activeCategory, initialPosts])

  // 검색어 변경 시 데이터 가져오기
  useEffect(() => {
    async function searchData() {
      if (!searchQuery.trim()) {
        // 검색어가 없으면 초기 상태로 복원
        setFilteredPosts(initialPosts || [])
        return
      }

      setLoading(true)
      try {
        // API 라우트를 통해 검색 요청
        try {
          const response = await fetch(`/api/posts/esg/search?keyword=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          setFilteredPosts(data.posts || []);
        } catch (error) {
          console.error('ESG 검색 API 오류:', error);
          setFilteredPosts([]);
        }
      } catch (error) {
        console.error('ESG 검색 중 오류 발생:', error)
        setFilteredPosts([])
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
    { id: ESGCategory.ENVIRONMENT, name: { ko: '환경', en: 'Environment' } },
    { id: ESGCategory.SOCIAL, name: { ko: '사회공헌', en: 'Social' } },
    { id: ESGCategory.GOVERNANCE, name: { ko: '경영', en: 'Governance' } },
    { id: ESGCategory.ESG_MANAGEMENT, name: { ko: 'ESG 경영', en: 'ESG Management' } },
    { id: ESGCategory.SUSTAINABILITY, name: { ko: '지속가능성', en: 'Sustainability' } },
  ]

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-green-800 text-white py-16">
        <div className="echoit-container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[Raleway]">
            {language === 'ko' ? 'ESG 경영' : 'ESG Management'}
          </h1>
          <p className="text-gray-300 max-w-2xl">
            {language === 'ko'
              ? '에코아이티는 환경, 사회, 지배구조를 고려한 지속가능한 경영을 추구합니다.'
              : 'ECHOIT pursues sustainable management that considers the environment, society, and governance.'}
          </p>
        </div>
      </div>

      {/* ESG Overview */}
      <section className="bg-white py-16">
        <div className="echoit-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {language === 'ko' ? '지속가능한 성장을 위한 ESG 경영' : 'ESG Management for Sustainable Growth'}
              </h2>
              <div className="h-1 w-16 bg-green-600 mb-6"></div>
              <p className="text-gray-700 mb-6">
                {language === 'ko'
                  ? '에코아이티는 환경(Environment), 사회(Social), 지배구조(Governance)를 고려한 ESG 경영을 통해 지속가능한 성장을 추구합니다. 우리의 ESG 전략은 디지털 기술을 활용하여 환경 영향을 최소화하고, 사회적 가치를 창출하며, 투명하고 책임있는 경영 체계를 구축하는 데 중점을 두고 있습니다.'
                  : 'ECHOIT pursues sustainable growth through ESG management that considers Environment, Social, and Governance factors. Our ESG strategy focuses on minimizing environmental impact using digital technology, creating social value, and building a transparent and responsible management system.'
                }
              </p>
              <p className="text-gray-700">
                {language === 'ko'
                  ? '기업 시민으로서 사회적 책임을 다하고, 이해관계자들과 함께 지속가능한 미래를 만들어 나가는 것이 우리의 목표입니다.'
                  : 'Our goal is to fulfill our social responsibilities as a corporate citizen and create a sustainable future together with our stakeholders.'
                }
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                    <path d="M2 22v-1a5 5 0 0 1 5-5" />
                    <path d="M14 17a5 5 0 0 1 5 5v1" />
                    <circle cx="7" cy="11" r="3" />
                    <circle cx="17" cy="11" r="3" />
                    <path d="m4 20 3-9-9-4 9-4 3-9 3 9 9 4-9 4 3 9-7-5Z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">
                  {language === 'ko' ? '환경' : 'Environment'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'ko'
                    ? '탄소 중립, 친환경 솔루션 개발, 에너지 효율화'
                    : 'Carbon neutrality, eco-friendly solutions, energy efficiency'
                  }
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                    <path d="M18 20a6 6 0 0 0-12 0" />
                    <circle cx="12" cy="10" r="4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">
                  {language === 'ko' ? '사회' : 'Social'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'ko'
                    ? '교육 지원, 다양성과 포용성, 사회공헌활동'
                    : 'Education support, diversity & inclusion, social contribution'
                  }
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700">
                    <line x1="12" y1="3" x2="12" y2="21" />
                    <polyline points="9 18 12 21 15 18" />
                    <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
                    <path d="M14 15 19 10" />
                    <path d="M19 10h-5" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">
                  {language === 'ko' ? '지배구조' : 'Governance'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'ko'
                    ? '투명한 경영, 윤리경영, 이사회 다양성'
                    : 'Transparent management, business ethics, board diversity'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent ESG News */}
      {(recentPosts && recentPosts.length > 0) && (
        <section className="bg-gray-50 py-16">
          <div className="echoit-container">
            <h2 className="text-2xl font-bold mb-8">
              {language === 'ko' ? '최신 ESG 소식' : 'Recent ESG News'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentPosts.map(post => (
                <ESGCard key={post?._id?.toString() || post?.id || Math.random().toString()} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All ESG Posts */}
      <section className="py-16">
        <div className="echoit-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold">
              {language === 'ko' ? '모든 ESG 활동' : 'All ESG Activities'}
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
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name[language]}
              </button>
            ))}
          </div>

          {/* ESG Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {language === 'ko' ? '데이터를 불러오는 중입니다...' : 'Loading data...'}
              </p>
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <ESGCard key={post?._id?.toString() || post?.id || Math.random().toString()} post={post} />
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