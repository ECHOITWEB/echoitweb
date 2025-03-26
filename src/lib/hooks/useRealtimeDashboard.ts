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

/**
 * 대시보드 데이터 타입 정의
 */
export interface DashboardData {
  timestamp: string;
  totalStats: {
    newsViews: number;
    esgViews: number;
    recentNewsViews: number;
    recentESGViews: number;
  };
  recentNews: {
    _id: string;
    title: { ko: string; en?: string };
    publishedAt: string;
    viewCount: number;
    category: string;
  }[];
  recentESG: {
    _id: string;
    title: { ko: string; en?: string };
    publishedAt: string;
    viewCount: number;
    esgType: string;
  }[];
  newsStats: { _id: string; count: number }[];
  esgStats: { _id: string; count: number }[];
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

/**
 * 대시보드 데이터를 실시간으로 가져오는 커스텀 훅
 */
export default function useRealtimeDashboard(accessToken: string | null) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    // 토큰이 없으면 연결 시도하지 않음
    if (!accessToken) {
      if (mounted) {
        setError('인증 토큰이 없습니다');
        setIsLoading(false);
      }
      return;
    }

    // EventSource 연결 생성
    const sse = new EventSource(`/api/dashboard/realtime`, {
      withCredentials: true,
    });
    
    if (mounted) {
      setEventSource(sse);
    }

    // 연결 이벤트 처리
    sse.onopen = () => {
      if (mounted) {
        console.log('대시보드 실시간 연결 성공');
        setError(null);
      }
    };

    // 메시지 이벤트 처리
    sse.onmessage = (event) => {
      if (mounted) {
        try {
          const newData = JSON.parse(event.data);
          console.log('대시보드 데이터 업데이트:', newData);
          setData(newData);
          setIsLoading(false);
        } catch (err) {
          console.error('대시보드 데이터 파싱 오류:', err);
          setError('데이터 형식 오류');
        }
      }
    };

    // 오류 이벤트 처리
    sse.onerror = (err) => {
      console.error('대시보드 연결 오류:', err);
      if (mounted) {
        setError('서버 연결 오류');
        setIsLoading(false);
        sse.close();
      }
    };

    // 컴포넌트 언마운트 시 정리
    return () => {
      mounted = false;
      if (sse) {
        console.log('대시보드 연결 종료');
        sse.close();
      }
    };
  }, [accessToken]);

  // 수동 재연결 함수
  const reconnect = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsLoading(true);
    setError(null);
  };

  return { data, error, isLoading, reconnect };
}
