"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PlusCircle, Edit, Trash2, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast"
import { Badge } from '@/components/ui/badge';
import { FallbackImage } from '@/components/ui/fallback-image';

// ESG 게시물 인터페이스
interface ESGPost {
  _id: string;
  id?: string;
  title: {
    ko: string;
    en?: string;
  };
  content: {
    ko: string;
    en?: string;
  };
  summary?: {
    ko: string;
    en?: string;
  };
  slug: string;
  category: string;
  author?: {
    name: string;
    department?: string;
    _id?: string;
  } | string;  // 작성자가 객체 또는 문자열 ID일 수 있음
  publishDate: string;
  createdAt: string;
  thumbnailUrl?: string;
  imageSource?: string;
  viewCount: number;
  isPublished: boolean;
  isMainFeatured?: boolean;
}

// 토큰을 가져오는 함수
function getToken() {
  // 토큰을 한 번만 조회하도록 최적화
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) return token;
      
      const sessionStr = localStorage.getItem('echoit_auth_token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.accessToken) return session.accessToken;
      }
    }
  } catch (e) {
    console.error('토큰 가져오기 오류:', e);
  }
  
  return null;
}

export default function AdminESGPage() {
  const [posts, setPosts] = useState<ESGPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  // 컴포넌트 상단에 토큰 갱신 함수 추가
  const refreshToken = async (): Promise<string | null> => {
    try {
      console.log('토큰 갱신 시도 중...');
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`토큰 갱신 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.accessToken) {
        // 로컬 스토리지에 새 토큰 저장
        const sessionStr = localStorage.getItem('echoit_auth_token');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            session.accessToken = data.accessToken;
            localStorage.setItem('echoit_auth_token', JSON.stringify(session));
            console.log('토큰 갱신 성공');
            return data.accessToken;
          } catch (e) {
            console.error('세션 파싱 오류:', e);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
      return null;
    }
  };

  // loadPosts 함수 개선
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      console.log('ESG 데이터 로드 시작');
      
      // MongoDB에서 직접 ESG 데이터 가져오기 시도
      try {
        const response = await fetch('/api/posts/esg/published', {
          method: 'GET',
          cache: 'no-store'
        });
        
        console.log('ESG 게시글 API 응답 상태:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('ESG 게시글 API 응답 데이터:', JSON.stringify(data).substring(0, 200) + '...');
          
          if (Array.isArray(data) && data.length > 0) {
            console.log(`ESG 게시글 API에서 ${data.length}개의 게시물 가져옴`);
            setPosts(data);
            setIsLoading(false);
            return;
          } else if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
            console.log(`ESG 게시글 API에서 ${data.posts.length}개의 게시물 가져옴`);
            setPosts(data.posts);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('ESG 게시글 API 호출 오류:', error);
      }
      
      // API 요청 헤더 설정 (토큰 포함)
      let token = null;
      if (typeof window !== 'undefined') {
        const sessionStr = localStorage.getItem('echoit_auth_token');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            token = session?.accessToken;
            console.log('인증 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
          } catch (e) {
            console.error('토큰 파싱 오류:', e);
          }
        }
      }
      
      // API 요청 헤더 설정
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 기존 API 시도
      try {
        const response = await fetch('/api/posts/esg?withCounts=true', {
          method: 'GET',
          headers,
          cache: 'no-store'
        });
        
        console.log('ESG API 응답 상태:', response.status, response.statusText);
        
        // 토큰 만료로 401 오류가 발생한 경우
        if (response.status === 401) {
          console.log('토큰 만료, 갱신 후 재시도');
          const newToken = await refreshToken();
          
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            
            // 두 번째 시도
            const retryResponse = await fetch('/api/posts/esg?withCounts=true', {
              method: 'GET',
              headers,
              cache: 'no-store'
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              
              let esgData: ESGPost[] = [];
              
              if (data.success && Array.isArray(data.posts)) {
                esgData = data.posts;
              } else if (Array.isArray(data) && data.length > 0) {
                esgData = data;
              } else if (data.data && Array.isArray(data.data)) {
                esgData = data.data;
              }
              
              if (esgData.length > 0) {
                setPosts(esgData);
                setIsLoading(false);
                return;
              }
            }
          }
        } else if (response.ok) {
          const data = await response.json();
          
          let esgData: ESGPost[] = [];
          
          if (data.success && Array.isArray(data.posts)) {
            esgData = data.posts;
          } else if (Array.isArray(data) && data.length > 0) {
            esgData = data;
          } else if (data.data && Array.isArray(data.data)) {
            esgData = data.data;
          }
          
          if (esgData.length > 0) {
            setPosts(esgData);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('ESG API 호출 오류:', error);
      }
      
      // 대시보드 API 시도
      try {
        console.log('대시보드 API로 데이터 요청');
        
        const dashboardResponse = await fetch('/api/dashboard/realtime', {
          method: 'GET',
          headers,
          cache: 'no-store'
        });
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          console.log('대시보드 API 응답 성공');
          
          if (dashboardData.recentESG && Array.isArray(dashboardData.recentESG) && dashboardData.recentESG.length > 0) {
            console.log(`대시보드에서 ${dashboardData.recentESG.length}개의 ESG 포스트 가져옴`);
            
            // 대시보드 데이터 형식을 ESGPost 형식으로 변환
            const formattedESG = dashboardData.recentESG.map((post: any) => {
              return {
                _id: post._id || `dashboard-${Math.random().toString(36).substring(7)}`,
                title: post.title || { ko: post.title?.ko || '제목 없음' },
                content: post.content || { ko: '내용 없음' },
                summary: post.summary || { ko: post.summary?.ko || '요약 없음' },
                slug: post.slug || `esg-${Math.random().toString(36).substring(7)}`,
                category: post.category || post.esgType || 'environment',
                author: post.author || { name: '관리자', department: 'ESG팀' },
                publishDate: post.publishDate || post.publishedAt || post.createdAt || new Date().toISOString(),
                createdAt: post.createdAt || new Date().toISOString(),
                viewCount: post.viewCount || 0,
                isPublished: post.isPublished !== false
              };
            });
            
            console.log('대시보드 데이터를 ESG 형식으로 변환 완료');
            setPosts(formattedESG);
            setIsLoading(false);
            return;
          }
        }
      } catch (dashboardError) {
        console.error('대시보드 API 호출 중 오류:', dashboardError);
      }
      
      // 모든 API 호출 실패 시 샘플 데이터 사용
      console.log('모든 API 요청 실패, 샘플 데이터 사용');
      const sampleData = getSampleESGPosts();
      setPosts(sampleData);
    } catch (error) {
      console.error('ESG 데이터 로드 오류:', error);
      setErrorMessage('ESG 데이터를 불러오는 중 오류가 발생했습니다.');
      
      // 오류 발생 시 샘플 데이터 표시
      const sampleData = getSampleESGPosts();
      setPosts(sampleData);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };
  
  // 샘플 ESG 데이터 생성 함수
  const getSampleESGPosts = (): ESGPost[] => {
    const generateMongoId = () => {
      // 유효한 MongoDB ObjectId 형식(24자 hex)을 생성
      return Array(24).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
    };
    
    return [
      {
        _id: generateMongoId(),
        title: {
          ko: 'asdfasdf',
        },
        content: {
          ko: '샘플 환경 보호 활동 내용입니다.',
        },
        summary: {
          ko: '샘플 환경 보호 활동 요약 내용입니다.',
        },
        slug: 'sample-environment',
        category: 'environment',
        author: {
          name: '김환경',
          department: 'ESG팀'
        },
        publishDate: new Date().toISOString(),
        isPublished: true,
        viewCount: 87,
        createdAt: new Date().toISOString()
      },
      {
        _id: generateMongoId(),
        title: {
          ko: 'ㅁㅇㄴㄹㅇㄴㅁㄹㅇㄹ',
        },
        content: {
          ko: '샘플 사회공헌 활동 내용입니다.',
        },
        summary: {
          ko: '샘플 사회공헌 활동 요약 내용입니다.',
        },
        slug: 'sample-social',
        category: 'social',
        author: {
          name: '이사회',
          department: 'CSR팀'
        },
        publishDate: new Date().toISOString(),
        isPublished: true,
        viewCount: 45,
        createdAt: new Date().toISOString()
      },
      {
        _id: generateMongoId(),
        title: {
          ko: '랄랄라',
        },
        content: {
          ko: '샘플 지배구조 개선 내용입니다.',
        },
        summary: {
          ko: '샘플 지배구조 개선 요약 내용입니다.',
        },
        slug: 'sample-governance',
        category: 'governance',
        author: {
          name: '박경영',
          department: '경영지원팀'
        },
        publishDate: new Date().toISOString(),
        isPublished: false,
        viewCount: 32,
        createdAt: new Date().toISOString()
      }
    ];
  };

  // 게시물 삭제 처리
  const handleDelete = async (id: string) => {
    if (window.confirm('이 ESG 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/esg/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('ESG 게시물 삭제에 실패했습니다.');
        }
        
        toast({
          title: "삭제 성공",
          description: "ESG 게시물이 성공적으로 삭제되었습니다.",
        });
        
        // 삭제된 게시물을 목록에서 제거
        setPosts(prevPosts => prevPosts.filter(post => post._id !== id));
        setErrorMessage('');
      } catch (error) {
        console.error('ESG 게시물 삭제 오류:', error);
        setErrorMessage('ESG 게시물 삭제 중 오류가 발생했습니다.');
        toast({
          title: "삭제 실패",
          description: "ESG 게시물 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 메인 노출 상태 변경 처리
  const handleMainVisibilityChange = async (id: string, isVisible: boolean) => {
    try {
      console.log(`[디버그] 메인 노출 상태 변경 요청 시작 - ID: ${id}, 노출 여부: ${isVisible}`);
      setIsLoading(true);
      
      // 기본 헤더
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // localStorage에서 토큰 가져오기 (있는 경우에만)
      const token = getToken();
      if (token) {
        console.log('[디버그] 토큰 존재함:', token.substring(0, 10) + '...');
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.log('[디버그] 경고: 토큰이 없습니다. API 호출이 실패할 수 있습니다.');
      }
      
      console.log('[디버그] API 요청 헤더:', headers);
      console.log('[디버그] API 요청 본문:', { isMainFeatured: isVisible });
      
      const response = await fetch(`/api/posts/esg/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isMainFeatured: isVisible }),
      });

      console.log(`[디버그] API 응답 상태: ${response.status} ${response.statusText}`);
      
      const responseData = await response.json();
      console.log('[디버그] API 응답 데이터:', responseData);
      
      if (!response.ok) {
        // 403 에러 (권한 없음)가 발생한 경우 특별 처리
        if (response.status === 403) {
          console.log('[디버그] 권한 오류: 관리자 권한으로 로그인이 필요합니다.');
          throw new Error('권한이 부족합니다. 관리자 권한으로 로그인해주세요.');
        } else {
          throw new Error(responseData.message || responseData.error || '메인 노출 상태 업데이트에 실패했습니다.');
        }
      }
      
      // 상태 업데이트
      setPosts(prevPosts => prevPosts.map(item => 
        item._id === id ? { ...item, isMainFeatured: isVisible } : item
      ));
      
      toast({
        title: '업데이트 완료',
        description: `메인 노출 상태가 ${isVisible ? '활성화' : '비활성화'}되었습니다.`,
      });
      setErrorMessage('');
    } catch (error: any) {
      console.error('[디버그] 메인 노출 상태 업데이트 실패:', error);
      toast({
        title: '오류 발생',
        description: error.message || '메인 노출 상태 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
      
      // 오류 발생 시에도 UI 반영을 위해 즉시 데이터 다시 로드
      loadPosts();
    } finally {
      setIsLoading(false);
    }
  };

  // 게시 상태 변경 처리
  const handlePublishChange = async (id: string, isPublished: boolean) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/esg/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished }),
      });
      
      if (!response.ok) {
        throw new Error('게시 상태 업데이트에 실패했습니다.');
      }
      
      // 상태 업데이트
      setPosts(prevPosts => prevPosts.map(item => 
        item._id === id ? { ...item, isPublished } : item
      ));
      
      toast({
        title: '업데이트 완료',
        description: `게시물이 ${isPublished ? '공개' : '비공개'}되었습니다.`,
      });
      setErrorMessage('');
    } catch (error) {
      console.error('게시 상태 업데이트 실패:', error);
      toast({
        title: '오류 발생',
        description: '게시 상태 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 라벨 표시
  const getCategoryLabel = (category: string) => {
    const categories: Record<string, { label: string, color: string }> = {
      'environment': { label: '환경', color: 'bg-green-100 text-green-800' },
      'social': { label: '사회', color: 'bg-blue-100 text-blue-800' },
      'governance': { label: '지배구조', color: 'bg-purple-100 text-purple-800' },
      'csr': { label: '사회공헌사업', color: 'bg-yellow-100 text-yellow-800' },
      'sustainability': { label: '지속가능경영', color: 'bg-teal-100 text-teal-800' },
      'esg_management': { label: 'ESG경영', color: 'bg-indigo-100 text-indigo-800' },
      'other': { label: '기타', color: 'bg-gray-100 text-gray-800' }
    };

    return categories[category] || { label: category, color: 'bg-gray-100 text-gray-800' };
  };

  // 로딩 화면
  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">ESG 게시물을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ESG 관리</h1>
        <Link
          href="/admin/esg/create"
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          새 ESG 게시물 작성
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 p-4 rounded-md text-green-700 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        {posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이미지
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성자
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    메인 노출
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => {
                  const categoryInfo = getCategoryLabel(post.category);

                  // 작성자 정보
                  let authorName = "미지정";
                  let authorDepartment = "";
                  
                  if (post.author) {
                    // 작성자 객체가 있는 경우
                    if (typeof post.author === 'object') {
                      authorName = post.author.name || "미지정";
                      authorDepartment = post.author.department || "";
                    } 
                    // 작성자가 ID 문자열인 경우 (해시값)
                    else if (typeof post.author === 'string') {
                      authorName = "사용자";
                      authorDepartment = "ID: " + post.author.substring(0, 8) + "...";
                    }
                  }

                  // URL 정보
                  const postUrl = `/notice/esg/${post.slug}`;

                  return (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative h-16 w-16 overflow-hidden rounded">
                          <FallbackImage
                            src={post.thumbnailUrl || post.imageSource || '/images/news_default.png'}
                            alt={post.title.ko}
                            fill
                            sizes="64px"
                            className="object-cover"
                            fallbackSrc="/images/news_default.png"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{post.title.ko}</div>
                        <div className="text-xs text-blue-600 truncate max-w-xs mt-1">
                          <a href={postUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {postUrl}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(post.publishDate), 'yyyy년 MM월 dd일', { locale: ko })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={categoryInfo.color}>
                          {categoryInfo.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {post.author ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700">
                              {typeof post.author === 'string' 
                                ? post.author 
                                : (post.author.name || '알 수 없음')}
                            </span>
                            {typeof post.author === 'object' && post.author.department && (
                              <span className="text-xs text-gray-500 mt-1">
                                {post.author.department}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={post.isMainFeatured || false}
                            onCheckedChange={(checked) => handleMainVisibilityChange(post._id, checked)}
                            disabled={isLoading}
                          />
                          <span className="text-xs text-gray-500">
                            {post.isMainFeatured ? (
                              <div className="flex items-center text-green-600">
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                <span>노출</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-400">
                                <EyeOff className="w-3.5 h-3.5 mr-1" />
                                <span>비노출</span>
                              </div>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link
                            href={`/admin/esg/edit/${post._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-5 h-5" />
                            <span className="sr-only">편집</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-5 h-5" />
                            <span className="sr-only">삭제</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>등록된 ESG 게시물이 없습니다. 새 ESG 게시물을 작성해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
