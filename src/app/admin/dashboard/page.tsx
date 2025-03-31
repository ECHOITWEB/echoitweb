"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRealtimeDashboard } from '@/lib/hooks/useRealtimeDashboard';
import {
  RefreshCw, AlertCircle, Eye, Leaf, Newspaper, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 대시보드 카드에 사용할 색상 정의
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'
] as const;

const CATEGORY_COLORS = {
  'environment': '#00C49F',
  'social': '#0088FE',
  'governance': '#FFBB28'
} as const;

interface DashboardStats {
  newsCount: number;
  esgCount: number;
  newsViews: number;
  esgViews: number;
  recentNewsViews: number;
  recentESGViews: number;
}

interface RecentPost {
  _id: string;
  title: {
    ko: string;
  };
  category?: string;
  esgType?: string;
  viewCount: number;
  publishedAt: string;
}

interface CategoryStat {
  _id: string;
  count: number;
}

interface ColorClasses {
  blue: string;
  green: string;
  amber: string;
  indigo: string;
  purple: string;
}

type ColorType = keyof ColorClasses;

// 로딩 컴포넌트
function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}

// 에러 컴포넌트
function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <AlertCircle className="w-8 h-8 text-red-500" />
      <p className="text-lg font-medium text-red-500">{message}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="mt-2"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        새로고침
      </Button>
    </div>
  );
}

// 요약 통계 카드 컴포넌트
function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  period 
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  period?: string;
}): JSX.Element {
  const colorClasses: ColorClasses = {
    blue: "bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-50 text-green-500 dark:bg-green-900/30 dark:text-green-400",
    amber: "bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400",
    indigo: "bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400",
    purple: "bg-purple-50 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change !== undefined && period && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              ↑ {change}% {period}
            </p>
          )}
        </div>
        <div className="text-blue-500 dark:text-blue-400">{icon}</div>
      </div>
    </div>
  );
}

// 최근 게시물 컴포넌트
function RecentPostItem({ post, type }: { post: RecentPost; type: 'news' | 'esg' }): JSX.Element {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div>
        <h3 className="font-medium">{post.title.ko}</h3>
        <p className="text-sm text-gray-500">
          {type === 'news' ? '뉴스' : 'ESG'} - {type === 'news' ? post.category : post.esgType}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          조회수: {post.viewCount}
        </div>
        <div className="text-sm text-gray-500">
          {new Date(post.publishedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// 카테고리 통계 컴포넌트
function CategoryStatsList({ stats }: { stats: CategoryStat[] }): JSX.Element {
  return (
    <div className="space-y-2">
      {stats.map((category) => (
        <div key={category._id} className="flex justify-between items-center">
          <span className="text-sm font-medium">{category._id}</span>
          <span className="text-sm text-gray-500">{category.count}개</span>
        </div>
      ))}
    </div>
  );
}

// 상대적 시간 포맷 함수
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) {
    return `${diff}초 전`;
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}분 전`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}시간 전`;
  } else if (diff < 604800) {
    return `${Math.floor(diff / 86400)}일 전`;
  } else {
    return date.toLocaleDateString();
  }
}

// 배열 객체의 평균 계산 함수
function calculateAverage<T extends Record<string, number>>(items: T[], field: keyof T): string {
  if (!items || items.length === 0) return '0';

  const sum = items.reduce((acc, item) => acc + item[field], 0);
  return (sum / items.length).toFixed(0);
}

// 메인 대시보드 컴포넌트
export default function AdminDashboardPage(): JSX.Element {
  const { user } = useAuth();
  const { data, error, isLoading } = useRealtimeDashboard();
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Update the last update time whenever new dashboard data arrives
  useEffect(() => {
    if (data?.timestamp) {
      const date = new Date(data.timestamp);
      setLastUpdate(date.toLocaleTimeString());
    }
  }, [data?.timestamp]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        message={error.message} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <ErrorDisplay 
        message="데이터를 불러올 수 없습니다." 
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Destructure data for easier access
  const { totalStats, recentNews, recentESG, newsStats, esgStats } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <div className="flex items-center text-sm text-gray-500">
          마지막 업데이트: {lastUpdate}
          <RefreshCw className="w-4 h-4 ml-2" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 뉴스</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.newsCount}</div>
            <p className="text-xs text-muted-foreground">
              최근 30일 조회수: {totalStats.recentNewsViews}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 ESG</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.esgCount}</div>
            <p className="text-xs text-muted-foreground">
              최근 30일 조회수: {totalStats.recentESGViews}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">뉴스 통계</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.newsViews}</div>
            <p className="text-xs text-muted-foreground">
              뉴스 게시물 수: {totalStats.newsCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ESG 통계</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.esgViews}</div>
            <p className="text-xs text-muted-foreground">
              ESG 게시물 수: {totalStats.esgCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">최근 게시물</h2>
        <div className="space-y-4">
          {recentNews.map((post) => (
            <RecentPostItem key={post._id} post={post} type="news" />
          ))}
          
          {recentESG.map((post) => (
            <RecentPostItem key={post._id} post={post} type="esg" />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>뉴스 카테고리 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryStatsList stats={newsStats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ESG 카테고리 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryStatsList stats={esgStats} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

