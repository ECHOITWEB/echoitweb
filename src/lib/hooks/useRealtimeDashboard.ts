'use client';

import { useState, useEffect } from 'react';
import { getSession } from '../auth/session';

// 사용자 역할 타입
type UserRole = 'admin' | 'editor' | 'viewer';

interface DashboardStats {
  totalNewsViews: number;
  totalESGViews: number;
  recentNewsCount: number;
  recentESGCount: number;
  newsPostCount: number;
  esgPostCount: number;
}

interface RecentPost {
  _id: string;
  title: string;
  category: string;
  publishDate: string;
}

export interface DashboardData {
  serverTime: string;
  summary: {
    totalNews: number;
    recentNews: number;
    totalESG: number;
    recentESG: number;
    totalViews: number;
    totalLikes: number;
  };
  recentActivity: {
    timestamp: string;
    action: string;
    details: string;
    type: string;
  }[];
  analytics: {
    views: {
      date: string;
      count: number;
    }[];
    likes: {
      date: string;
      count: number;
    }[];
  };
  stats: DashboardStats;
  recentPosts: RecentPost[];
  categories: {
    news: Array<{ _id: string; count: number }>;
    esg: Array<{ _id: string; count: number }>;
  };
}

interface UseRealtimeDashboardReturn {
  data: DashboardData | null;
  error: Error | null;
  isLoading: boolean;
}

// 뉴스 아이템 인터페이스
interface NewsItem {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
}

// ESG 아이템 인터페이스
interface ESGItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  createdAt: string;
}

// 뉴스 조회수 아이템 인터페이스
interface NewsViewItem {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
}

// ESG 조회수 아이템 인터페이스
interface ESGViewItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  viewCount: number;
}

// 카테고리 분포 아이템 인터페이스
interface CategoryDistItem {
  name: string;
  value: number;
}

// 시간별 조회수 인터페이스
interface HourlyViewItem {
  hour: string;
  views: number;
  formattedHour: string;
}

// 사용자 로그인 아이템 인터페이스
interface UserLoginItem {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  lastLogin: string;
}

export function useRealtimeDashboard(): UseRealtimeDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    const connectSSE = () => {
      try {
        if (eventSource) {
          eventSource.close();
        }

        eventSource = new EventSource('/api/dashboard/realtime');

        eventSource.onmessage = (event) => {
          try {
            const newData = JSON.parse(event.data);
            setData(newData);
            setIsLoading(false);
            setError(null);
            retryCount = 0;
          } catch (err) {
            console.error('데이터 파싱 오류:', err);
            setError(new Error('데이터 형식이 올바르지 않습니다.'));
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE 연결 오류:', err);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(connectSSE, 3000);
          } else {
            setError(new Error('서버와의 연결이 끊어졌습니다. 페이지를 새로고침해주세요.'));
            setIsLoading(false);
          }
        };

        eventSource.addEventListener('connected', () => {
          console.log('SSE 연결됨');
          setError(null);
          retryCount = 0;
        });

      } catch (err) {
        console.error('SSE 초기화 오류:', err);
        setError(new Error('실시간 데이터 연결에 실패했습니다.'));
        setIsLoading(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return {
    data,
    error: error ? new Error(error.message) : null,
    isLoading
  };
}
