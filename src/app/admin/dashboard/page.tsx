"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRealtimeDashboard, DashboardData } from '@/lib/hooks/useRealtimeDashboard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  RefreshCw, AlertCircle, BookOpen, FileText, Users, Clock, BarChart as BarChartIcon,
  TrendingUp, Zap, CheckCircle, XCircle, Cpu, Activity
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const CATEGORY_COLORS = {
  'environment': '#00C49F',
  'social': '#0088FE',
  'governance': '#FFBB28'
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, connected, reconnect } = useRealtimeDashboard();
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Update the last update time whenever new dashboard data arrives
  useEffect(() => {
    if (data?.serverTime) {
      const date = new Date(data.serverTime);
      setLastUpdate(date.toLocaleTimeString());
    }
  }, [data?.serverTime]);

  // Handle reconnection on errors
  const handleReconnect = () => {
    reconnect();
  };

  // If loading and no data, show a loading state
  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">대시보드</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // If error, show error state with reconnect button
  if (error && !data) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">대시보드</h1>
          <button
            onClick={handleReconnect}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            재연결
          </button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                데이터 로드 오류
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                재연결 버튼을 클릭하여 다시 시도해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no data available yet, show placeholder
  if (!data) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">대시보드</h1>
          <button
            onClick={handleReconnect}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </button>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
            <p className="text-yellow-700 dark:text-yellow-300">
              대시보드 데이터를 불러올 수 없습니다. 새로고침을 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Destructure data for easier access
  const { summary, recentActivity, analytics } = data;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">관리자 대시보드</h1>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">
            마지막 업데이트: {lastUpdate}
          </span>
          <div className="flex items-center mr-4">
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {connected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
          <button
            onClick={handleReconnect}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                업데이트 중...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="총 게시물"
          value={summary.totalPosts}
          icon={<FileText className="w-5 h-5" />}
          subtext={`이번 달: ${summary.postsThisMonth}개 게시`}
          color="blue"
        />
        <StatCard
          title="뉴스 게시물"
          value={summary.totalNews}
          icon={<BookOpen className="w-5 h-5" />}
          subtext={`평균 조회수: ${calculateAverage(analytics.topViewedNews, 'viewCount')}`}
          color="indigo"
        />
        <StatCard
          title="ESG 게시물"
          value={summary.totalESG}
          icon={<FileText className="w-5 h-5" />}
          subtext={`평균 조회수: ${calculateAverage(analytics.topViewedESG, 'viewCount')}`}
          color="green"
        />
        <StatCard
          title="사용자"
          value={summary.totalUsers}
          icon={<Users className="w-5 h-5" />}
          subtext={`관리자: ${summary.usersByRole.admin}, 편집자: ${summary.usersByRole.editor}`}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ESG Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            ESG 카테고리 분포
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.esgCategoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.esgCategoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Views */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            시간별 조회수
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.hourlyViews}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="formattedHour"
                  tick={{ fontSize: 12 }}
                  interval={3}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity and Popular Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              최근 활동
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivity.news.slice(0, 3).map((item) => (
              <ActivityItem
                key={item.id}
                title={item.title}
                time={formatTime(item.createdAt)}
                type="news"
              />
            ))}
            {recentActivity.esg.slice(0, 3).map((item) => (
              <ActivityItem
                key={item.id}
                title={item.title}
                time={formatTime(item.createdAt)}
                type="esg"
                category={item.category}
              />
            ))}
            {recentActivity.logins.slice(0, 3).map((item) => (
              <ActivityItem
                key={item.id}
                title={`${item.name} (${item.username}) 로그인`}
                time={formatTime(item.lastLogin)}
                type="login"
                role={item.role}
              />
            ))}
          </div>
        </div>

        {/* Popular Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              인기 콘텐츠 (조회수)
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {analytics.topViewedNews.slice(0, 3).map((item) => (
              <PopularItem
                key={item.id}
                title={item.title}
                views={item.viewCount}
                type="news"
              />
            ))}
            {analytics.topViewedESG.slice(0, 3).map((item) => (
              <PopularItem
                key={item.id}
                title={item.title}
                views={item.viewCount}
                type="esg"
                category={item.category}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for displaying summary statistics
function StatCard({ title, value, icon, subtext, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtext: string;
  color: 'blue' | 'green' | 'amber' | 'indigo' | 'purple';
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
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {value.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {subtext}
      </div>
    </div>
  );
}

// Component for displaying activity items
function ActivityItem({ title, time, type, category, role }: {
  title: string;
  time: string;
  type: 'news' | 'esg' | 'login';
  category?: string;
  role?: string;
}) {
  const getIcon = () => {
    switch (type) {
      case 'news':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'esg':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'login':
        return <Users className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBadge = () => {
    if (type === 'esg' && category) {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          style={{ backgroundColor: `${CATEGORY_COLORS[category]}20`, color: CATEGORY_COLORS[category] }}
        >
          {category === 'environment' && '환경(E)'}
          {category === 'social' && '사회(S)'}
          {category === 'governance' && '지배구조(G)'}
        </span>
      );
    }

    if (type === 'login' && role) {
      const roleColors = {
        admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        viewer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      };

      const roleNames = {
        admin: '관리자',
        editor: '편집자',
        viewer: '조회자'
      };

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]}`}>
          {roleNames[role]}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getIcon()}
          <span className="ml-3 text-sm font-medium text-gray-800 dark:text-white">{title}</span>
          {getBadge() && <span className="ml-2">{getBadge()}</span>}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{time}</div>
      </div>
    </div>
  );
}

// Component for displaying popular content items
function PopularItem({ title, views, type, category }: {
  title: string;
  views: number;
  type: 'news' | 'esg';
  category?: string;
}) {
  const getIcon = () => {
    switch (type) {
      case 'news':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'esg':
        return <FileText className="w-4 h-4 text-green-500" />;
      default:
        return <BarChartIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBadge = () => {
    if (type === 'esg' && category) {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          style={{ backgroundColor: `${CATEGORY_COLORS[category]}20`, color: CATEGORY_COLORS[category] }}
        >
          {category === 'environment' && '환경(E)'}
          {category === 'social' && '사회(S)'}
          {category === 'governance' && '지배구조(G)'}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getIcon()}
          <span className="ml-3 text-sm font-medium text-gray-800 dark:text-white">{title}</span>
          {getBadge() && <span className="ml-2">{getBadge()}</span>}
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {views} <span className="text-xs">조회</span>
        </div>
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
