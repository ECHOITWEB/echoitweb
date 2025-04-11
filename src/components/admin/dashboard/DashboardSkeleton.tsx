import React from 'react';

/**
 * 대시보드 로딩 시 표시할 스켈레톤 UI 컴포넌트
 */
export default function DashboardSkeleton() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 mb-6"></div>
      
      {/* 요약 카드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={`card-skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <div className="flex justify-between mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
      
      {/* 차트 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[...Array(2)].map((_, index) => (
          <div key={`chart-skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 통계 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[...Array(2)].map((_, index) => (
          <div key={`stats-skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={`stat-${index}-${i}`} className="flex items-center mb-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/5 mr-2"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full flex-grow"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 ml-2"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* 버튼 스켈레톤 */}
      <div className="flex flex-wrap gap-2">
        {[...Array(4)].map((_, index) => (
          <div key={`button-skeleton-${index}`} className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md w-32"></div>
        ))}
      </div>
    </div>
  );
} 