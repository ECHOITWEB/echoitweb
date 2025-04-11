'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUp, ArrowDown, Eye, Calendar, FileText, Newspaper,
  Leaf, Users, BarChart, PieChart, RefreshCw, AlertTriangle,
  ArrowRight, BarChart2, BookOpen, Clock, Settings2
} from 'lucide-react';
import { useRealtimeDashboard } from '@/lib/hooks/useRealtimeDashboard';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import DashboardSkeleton from '@/components/admin/dashboard/DashboardSkeleton';
import { useAuth } from '@/context/auth-context';

// 대시보드 페이지 컴포넌트
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-cache';
export const revalidate = 60;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 로그인 상태 체크
  useEffect(() => {
    // 미로그인 상태면 로그인 페이지로 리디렉션
    if (!user) {
      router.push('/admin/login');
      return;
    }
  }, [user, router]);

  // 대시보드 데이터 가져오기
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/data');
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('대시보드 데이터 로딩 실패:', err);
      setError(err instanceof Error ? err : new Error('데이터를 가져오는 중 오류가 발생했습니다.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 데이터 로딩
  useEffect(() => {
    fetchDashboardData();
    
    // 프리페치를 통한 성능 최적화
    router.prefetch('/admin/news');
    router.prefetch('/admin/esg');
    router.prefetch('/admin/users');
    router.prefetch('/admin/settings');
  }, [fetchDashboardData, router]);

  // 데이터 새로고침 함수
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  // 카드 컴포넌트 - 성능 최적화를 위해 메모이제이션
  const AdminCard = React.memo(({ title, count, link, icon: Icon }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <Link href={link} className="text-xs text-blue-500 hover:underline mt-1 inline-block">
          자세히 보기 <ArrowRight className="h-3 w-3 inline" />
        </Link>
      </CardContent>
    </Card>
  ));

  // 차트 컴포넌트 - 불필요한 리렌더링 방지
  const StatChart = React.memo(({ data, title, dataKey, color }: any) => (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  ));

  // 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // 데이터가 없는 경우 처리
  if (!dashboardData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">대시보드</h1>
        <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">데이터 로딩 오류</h3>
              <p className="text-red-600 dark:text-red-300 mt-1">{error?.message || '데이터를 불러올 수 없습니다'}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md inline-flex items-center hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 통계 카드 데이터
  const totalNewsViews = dashboardData?.totalStats?.newsViews || 0;
  const totalESGViews = dashboardData?.totalStats?.esgViews || 0;
  const recentNewsViews = dashboardData?.totalStats?.recentNewsViews || 0;
  const recentESGViews = dashboardData?.totalStats?.recentESGViews || 0;

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
      value: (dashboardData?.totalStats?.newsCount || 0).toLocaleString(),
      icon: <Newspaper className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      onClick: () => router.push('/admin/news'),
    },
    {
      title: 'ESG 게시물 수',
      value: (dashboardData?.totalStats?.esgCount || 0).toLocaleString(),
      icon: <Leaf className="w-6 h-6 text-teal-500" />,
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      onClick: () => router.push('/admin/esg'),
    },
  ];

  // 뉴스 카테고리 데이터 가공
  const newsCategoryData = dashboardData?.categoryStats?.news?.map((cat: any) => ({
    name: cat.category || '기타',
    count: cat.count || 0,
  })) || [];

  // ESG 카테고리 데이터 가공
  const esgCategoryData = dashboardData?.categoryStats?.esg?.map((cat: any) => ({
    name: cat.category || '기타',
    count: cat.count || 0,
  })) || [];

  // UI 렌더링
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-2">마지막 업데이트:</span>
          <span>{formatDate(dashboardData.timestamp)}</span>
          <button
            onClick={handleRefresh}
            className="ml-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
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
            {dashboardData?.recentNews?.slice(0, 3).map((news, index) => (
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

            {dashboardData?.recentESG?.slice(0, 3).map((esg, index) => (
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

            {(!dashboardData?.recentNews?.length && !dashboardData?.recentESG?.length) && (
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
                {newsCategoryData.map((stat, index) => (
                  <div key={`news-stat-${index}`} className="flex items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-24 truncate">{stat.name}</span>
                    <div className="flex-grow mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (stat.count / (dashboardData.totalCount?.news || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{stat.count}</span>
                  </div>
                ))}

                {(!dashboardData?.categoryStats?.news?.length) && (
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
                {esgCategoryData.map((stat, index) => (
                  <div key={`esg-stat-${index}`} className="flex items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-24 truncate">{stat.category || '미분류'}</span>
                    <div className="flex-grow mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (stat.count / (dashboardData.totalCount?.esg || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{stat.count}</span>
                  </div>
                ))}

                {(!dashboardData?.categoryStats?.esg?.length) && (
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
