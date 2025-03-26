'use client';

import { useState, useEffect } from 'react';

// 다국어 타입
interface MultiLingual {
  ko: string;
  en?: string;
}

// 대시보드 전체 통계 인터페이스
interface TotalStats {
  newsViews: number;
  esgViews: number; 
  recentNewsViews: number;
  recentESGViews: number;
  newsCount: number;
  esgCount: number;
}

// 뉴스 게시물 인터페이스
interface NewsPostItem {
  _id: string;
  title: MultiLingual;
  publishedAt: string;
  viewCount: number;
  category: string;
}

// ESG 게시물 인터페이스
interface ESGPostItem {
  _id: string;
  title: MultiLingual;
  publishedAt: string;
  viewCount: number;
  esgType: string;
}

// 카테고리 통계 인터페이스
interface CategoryStats {
  _id: string;
  count: number;
}

// 전체 대시보드 데이터 인터페이스
export interface DashboardData {
  timestamp: string;
  totalStats: TotalStats;
  recentNews: NewsPostItem[];
  recentESG: ESGPostItem[];
  newsStats: CategoryStats[];
  esgStats: CategoryStats[];
  error?: string;
}

interface UseRealtimeDashboardReturn {
  data: DashboardData | null;
  error: Error | null;
  isLoading: boolean;
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
        console.log('대시보드 데이터 연결 중...');

        eventSource.onmessage = (event) => {
          try {
            // 전체 데이터 로깅은 제거하고 간단한 메시지만 출력
            console.log('대시보드 데이터 갱신됨');
            const newData = JSON.parse(event.data);
            setData(newData);
            setIsLoading(false);
            setError(null);
            retryCount = 0;
          } catch (err) {
            console.error('데이터 파싱 오류');
            setError(new Error('데이터 형식이 올바르지 않습니다.'));
          }
        };

        eventSource.onerror = (err) => {
          console.error('대시보드 연결 오류');
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`재연결 시도 중... (${retryCount}/${maxRetries})`);
            setTimeout(connectSSE, 3000);
          } else {
            setError(new Error('서버와의 연결이 끊어졌습니다. 페이지를 새로고침해주세요.'));
            setIsLoading(false);
          }
        };

        eventSource.addEventListener('connected', () => {
          console.log('대시보드 연결 성공');
          setError(null);
          retryCount = 0;
        });

        eventSource.addEventListener('error', (event) => {
          const errorData = JSON.parse((event as any).data);
          console.error('서버 오류');
          setError(new Error(errorData.message || '서버에서 오류가 발생했습니다.'));
        });

      } catch (err) {
        console.error('대시보드 연결 초기화 실패');
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
