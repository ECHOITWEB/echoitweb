'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUp, ArrowDown, Eye, Calendar, FileText, Newspaper,
  Leaf, Users, BarChart, PieChart, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useRealtimeDashboard } from '@/lib/hooks/useRealtimeDashboard';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// 대시보드 페이지 컴포넌트
export default function AdminDashboardPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // 실시간 대시보드 데이터 구독
  const { data, error, isLoading } = useRealtimeDashboard();

  // 데이터 새로고침 함수
  const reconnect = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch (error) {
      return '날짜 없음';
    }
  };

  // 트렌드 계산 (상승 또는 하락)
  const calculateTrend = (total: number, recent: number) => {
    if (total === 0) return 'up'; // 데이터가 없으면 기본값
    const percentage = (recent / total) * 100;
    return percentage >= 30 ? 'up' : 'down'; // 30% 이상이면 상승 트렌드
  };

  // 로딩 중 UI
  if (isLoading && !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">대시보드</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="text-center my-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">실시간 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 오류 UI
  if (error && !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">대시보드</h1>
        <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">데이터 로딩 오류</h3>
              <p className="text-red-600 dark:text-red-300 mt-1">{error.message}</p>
              <button
                onClick={reconnect}
                className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md inline-flex items-center hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                재연결 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 통계 카드 데이터 (실시간 데이터 또는 기본값)
  const totalNewsViews = data?.totalStats?.newsViews || 0;
  const totalESGViews = data?.totalStats?.esgViews || 0;
  const recentNewsViews = data?.totalStats?.recentNewsViews || 0;
  const recentESGViews = data?.totalStats?.recentESGViews || 0;

  const newsTrend = calculateTrend(totalNewsViews, recentNewsViews);
  const esgTrend = calculateTrend(totalESGViews, recentESGViews);

  const newsPercentage = totalNewsViews === 0 ? 0 : Math.floor((recentNewsViews / totalNewsViews) * 100);
  const esgPercentage = totalESGViews === 0 ? 0 : Math.floor((recentESGViews / totalESGViews) * 100);

  // 통계 카드 데이터
  const statCards = [
    {
      title: '총 뉴스 조회수',
      value: totalNewsViews.toLocaleString(),
      trend: newsTrend,
      trendValue: `${newsPercentage}%`,
      icon: <Eye className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      onClick: () => router.push('/admin/news'),
    },
    {
      title: '총 ESG 조회수',
      value: totalESGViews.toLocaleString(),
      trend: esgTrend,
      trendValue: `${esgPercentage}%`,
      icon: <Eye className="w-6 h-6 text-green-500" />,
      bg: 'bg-green-50 dark:bg-green-900/20',
      onClick: () => router.push('/admin/esg'),
    },
    {
      title: '뉴스 게시물 수',
      value: (data?.totalStats?.newsCount || 0).toLocaleString(),
      icon: <Newspaper className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      onClick: () => router.push('/admin/news'),
    },
    {
      title: 'ESG 게시물 수',
      value: (data?.totalStats?.esgCount || 0).toLocaleString(),
      icon: <Leaf className="w-6 h-6 text-teal-500" />,
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      onClick: () => router.push('/admin/esg'),
    },
  ];

  // UI 렌더링
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        {data && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">마지막 업데이트:</span>
            <span>{formatDate(data.timestamp)}</span>
            <button
              onClick={reconnect}
              className="ml-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-5 cursor-pointer hover:shadow-md transition-shadow ${card.bg} border border-gray-100 dark:border-gray-700`}
            onClick={card.onClick}
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.title}</p>
              {card.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</h3>
            {card.trend && (
              <div className="flex items-center">
                {card.trend === 'up' ? (
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${card.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {card.trendValue} 최근 30일
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 최근 활동 & 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 최근 활동 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center justify-between">
            <span>최근 게시물</span>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
          </h2>
          <div className="space-y-4">
            {data?.recentNews?.slice(0, 3).map((news, index) => (
              <div key={`news-${index}`} className="flex items-start">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300 mr-3">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-1">
                    {news.title.ko}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(news.publishedAt)}
                    </p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Eye className="w-3 h-3 mr-1" /> {news.viewCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {data?.recentESG?.slice(0, 3).map((esg, index) => (
              <div key={`esg-${index}`} className="flex items-start">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-gray-700 dark:text-gray-300 mr-3">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-1">
                    {esg.title.ko}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(esg.publishedAt)}
                    </p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Eye className="w-3 h-3 mr-1" /> {esg.viewCount || 0}
                    </p>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                      {esg.esgType}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {(!data?.recentNews?.length && !data?.recentESG?.length) && (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                최근 게시물이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 카테고리 통계 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center justify-between">
            <span>콘텐츠 통계</span>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <BarChart className="w-4 h-4 mr-1 text-blue-500" />
                뉴스 카테고리별 분포
              </h3>
              <div className="space-y-2">
                {data?.newsStats?.map((stat, index) => (
                  <div key={`news-stat-${index}`} className="flex items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-24 truncate">{stat._id || '미분류'}</span>
                    <div className="flex-grow mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (stat.count / (data.newsStats.reduce((a, b) => a + b.count, 0) || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{stat.count}</span>
                  </div>
                ))}

                {(!data?.newsStats?.length) && (
                  <div className="py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                    데이터가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <PieChart className="w-4 h-4 mr-1 text-green-500" />
                ESG 유형별 분포
              </h3>
              <div className="space-y-2">
                {data?.esgStats?.map((stat, index) => (
                  <div key={`esg-stat-${index}`} className="flex items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-24 truncate">{stat._id || '미분류'}</span>
                    <div className="flex-grow mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (stat.count / (data.esgStats.reduce((a, b) => a + b.count, 0) || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{stat.count}</span>
                  </div>
                ))}

                {(!data?.esgStats?.length) && (
                  <div className="py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                    데이터가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 링크 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">빠른 작업</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg p-3 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
            onClick={() => router.push('/admin/news/create')}
          >
            <Newspaper className="w-5 h-5 mr-2" />
            <span>뉴스 작성</span>
          </button>
          <button
            className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg p-3 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
            onClick={() => router.push('/admin/esg/create')}
          >
            <Leaf className="w-5 h-5 mr-2" />
            <span>ESG 작성</span>
          </button>
          <button
            className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg p-3 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
            onClick={() => router.push('/admin/settings')}
          >
            <Users className="w-5 h-5 mr-2" />
            <span>사이트 설정</span>
          </button>
          <button
            className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400 rounded-lg p-3 flex items-center justify-center hover:bg-orange-100 dark:hover:bg-orange-800/30 transition-colors"
            onClick={() => router.push('/admin/brochure')}
          >
            <FileText className="w-5 h-5 mr-2" />
            <span>회사 소개서</span>
          </button>
        </div>
      </div>
    </div>
  );
}
