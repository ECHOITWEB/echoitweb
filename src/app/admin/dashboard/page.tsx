"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRealtimeDashboard, DashboardData } from '@/lib/hooks/useRealtimeDashboard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  RefreshCw, AlertCircle, BookOpen, FileText, Users, Clock, BarChart as BarChartIcon,
  PieChart as PieChartIcon, Activity, TrendingUp, Zap, CheckCircle, XCircle, Cpu, Eye, Leaf, Newspaper, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const CATEGORY_COLORS = {
  'environment': '#00C49F',
  'social': '#0088FE',
  'governance': '#FFBB28'
};

interface DashboardStats {
  totalNews: number;
  totalESG: number;
  recentNews: number;
  recentESG: number;
  totalNewsViews: number;
  totalNewsLikes: number;
  totalESGViews: number;
  totalESGLikes: number;
}

interface RecentPost {
  _id: string;
  title: string;
  type: 'news' | 'esg';
  category: string;
  publishDate: string;
  views: number;
  likes: number;
}

interface CategoryDisplay {
  _id: string;
  count: number;
}

export default function AdminDashboardPage() {
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-lg font-medium text-red-500">{error.message}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-8 h-8 text-yellow-500" />
        <p className="text-lg font-medium text-yellow-500">데이터를 불러올 수 없습니다.</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      </div>
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
            <div key={post._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div>
                <h3 className="font-medium">{post.title.ko}</h3>
                <p className="text-sm text-gray-500">
                  뉴스 - {post.category}
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
          ))}
          
          {recentESG.map((post) => (
            <div key={post._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div>
                <h3 className="font-medium">{post.title.ko}</h3>
                <p className="text-sm text-gray-500">
                  ESG - {post.esgType}
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
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>뉴스 카테고리 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newsStats.map((category) => (
                <div key={category._id} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category._id}</span>
                  <span className="text-sm text-gray-500">{category.count}개</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ESG 카테고리 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {esgStats.map((category) => (
                <div key={category._id} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category._id}</span>
                  <span className="text-sm text-gray-500">{category.count}개</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Component for displaying summary statistics
function StatCard({ title, value, change, icon, period }: {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  period?: string;
}) {
  const colorClasses = {
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

// Format date to relative time
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

// Calculate average from array objects
function calculateAverage(items: any[], field: string): string {
  if (!items || items.length === 0) return '0';

  const sum = items.reduce((acc, item) => acc + item[field], 0);
  return (sum / items.length).toFixed(0);
}

