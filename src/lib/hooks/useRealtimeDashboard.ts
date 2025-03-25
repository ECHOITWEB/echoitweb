'use client';

import { useState, useEffect } from 'react';
import { getSession } from '../auth/session';

// 사용자 역할 타입
type UserRole = 'admin' | 'editor' | 'viewer';

// 대시보드 데이터 인터페이스
export interface DashboardData {
  summary: {
    totalUsers: number;
    totalNews: number;
    totalESG: number;
    totalPosts: number;
    postsThisMonth: number;
    usersByRole: {
      admin: number;
      editor: number;
      viewer: number;
    };
  };
  recentActivity: {
    news: NewsItem[];
    esg: ESGItem[];
    logins: UserLoginItem[];
  };
  analytics: {
    topViewedNews: NewsViewItem[];
    topViewedESG: ESGViewItem[];
    esgCategoryDistribution: CategoryDistItem[];
    hourlyViews: HourlyViewItem[];
  };
  serverTime: string;
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
 * 실시간 대시보드 데이터를 SSE로 구독하는 훅
 * @returns 실시간 대시보드 데이터와 로딩/오류 상태
 */
export function useRealtimeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    // 이전 연결이 있으면 정리
    if (eventSource) {
      eventSource.close();
    }

    // EventSource 지원 확인
    if (typeof window === 'undefined' || !window.EventSource) {
      setError('이 브라우저는 서버 사이드 이벤트를 지원하지 않습니다.');
      setLoading(false);
      return;
    }

    // 인증 토큰 가져오기
    const session = getSession();
    if (!session?.accessToken) {
      setError('인증 토큰이 없습니다. 로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setConnected(false);

    try {
      // SSE 연결 설정 (인증 헤더 포함)
      const encodedToken = encodeURIComponent(session.accessToken);
      // URL에 토큰을 직접 포함하지 않고 보안적으로 안전한 방법 사용
      const sseUrl = `/api/dashboard/realtime`;

      const source = new EventSource(sseUrl);

      // 별도 fetch 요청으로 인증 토큰 전송
      fetch(sseUrl, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      }).catch((error) => {
        console.error('인증 요청 오류:', error);
      });

      // 연결 이벤트 처리
      source.addEventListener('connected', (event) => {
        setConnected(true);
        setLoading(false);
        console.log('SSE 연결됨:', JSON.parse(event.data));
      });

      // 대시보드 업데이트 이벤트 처리
      source.addEventListener('dashboard_update', (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
          setLoading(false);
        } catch (err) {
          console.error('SSE 메시지 처리 오류:', err);
          setError('데이터 처리 중 오류가 발생했습니다.');
        }
      });

      // 오류 이벤트 처리
      source.addEventListener('error', (event) => {
        try {
          const errorData = JSON.parse((event as MessageEvent).data);
          setError(errorData.message || '실시간 데이터 연결 중 오류가 발생했습니다.');
        } catch {
          setError('실시간 데이터 연결 중 오류가 발생했습니다.');
        }
        setLoading(false);
      });

      // 기본 오류 핸들러
      source.onerror = (err) => {
        console.error('SSE 연결 오류:', err);
        if (source.readyState === EventSource.CLOSED) {
          source.close();
          setError('연결이 종료되었습니다. 재연결을 시도해 주세요.');
          setConnected(false);
        }
        setLoading(false);
      };

      setEventSource(source);

      // 정리 함수
      return () => {
        source.close();
      };
    } catch (err) {
      console.error('SSE 설정 오류:', err);
      setError('실시간 데이터 연결을 설정하는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, []);

  // 재연결 함수
  const reconnect = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }

    setLoading(true);
    setError(null);
    setConnected(false);

    // effect가 다시 실행되도록 상태 변경
    setTimeout(() => {
      setLoading(true);
    }, 100);
  };

  return { data, loading, error, connected, reconnect };
}
