"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { FallbackImage } from '@/components/ui/fallback-image';

// 뉴스 카테고리 한글 표시
const categoryLabels: Record<string, string> = {
  'company': '회사소식',
  'product': '제품',
  'award': '수상',
  'media': '미디어',
  'event': '이벤트',
  'other': '기타'
};

// 뉴스 카테고리별 배지 색상
const categoryColors: Record<string, string> = {
  'company': 'bg-blue-100 text-blue-800',
  'product': 'bg-purple-100 text-purple-800',
  'award': 'bg-yellow-100 text-yellow-800',
  'media': 'bg-indigo-100 text-indigo-800',
  'event': 'bg-green-100 text-green-800',
  'other': 'bg-gray-100 text-gray-800'
};

// 뉴스 포스트 타입 정의
interface NewsPost {
  _id: string;
  title: {
    ko: string;
    en?: string;
  };
  summary: {
    ko: string;
    en?: string;
  };
  slug: string;
  category: string;
  author: {
    department: string;
    name: string;
  };
  publishDate: string;
  imageSource?: string;
  isPublished: boolean;
  isMainFeatured?: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// getToken 함수 내부에서 성능 최적화
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

// 토큰 갱신 함수
const refreshToken = async () => {
  try {
    console.log('토큰 갱신 시도');
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('echoit_auth_token', JSON.stringify(data));
        }
        console.log('토큰 갱신 성공');
        return data.accessToken;
      }
    }
    console.log('토큰 갱신 실패:', response.status);
    return null;
  } catch (error) {
    console.error('토큰 갱신 중 오류:', error);
    return null;
  }
};

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    fetchNews();
  }, []);

  // fetchNews 함수 개선
  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      console.log('뉴스 데이터 로드 시작');
      
      // API 요청 헤더 설정 (토큰 포함)
      let token = getToken();
      console.log('인증 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
      
      // API 요청 헤더 설정
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 모든 뉴스 가져오기 (발행 및 미발행 포함)
      try {
        console.log('모든 뉴스 데이터 요청 중...');
        const response = await fetch('/api/posts/news?withCounts=true', {
          method: 'GET',
          headers,
          cache: 'no-store'
        });
        
        console.log('뉴스 API 응답 상태:', response.status, response.statusText);
        
        // 토큰 만료로 401 오류가 발생한 경우
        if (response.status === 401) {
          console.log('토큰 만료, 갱신 후 재시도');
          const newToken = await refreshToken();
          
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            
            // 두 번째 시도
            const retryResponse = await fetch('/api/posts/news?withCounts=true', {
              method: 'GET',
              headers,
              cache: 'no-store'
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              
              let newsData: NewsPost[] = [];
              
              if (data.success && Array.isArray(data.posts)) {
                newsData = data.posts;
              } else if (Array.isArray(data) && data.length > 0) {
                newsData = data;
              } else if (data.data && Array.isArray(data.data)) {
                newsData = data.data;
              } else if (data.posts && Array.isArray(data.posts)) {
                newsData = data.posts;
              }
              
              if (newsData.length > 0) {
                console.log(`API에서 ${newsData.length}개의 뉴스 포스트 가져옴`);
                setPosts(newsData);
                setTotalPosts(data.total || newsData.length);
                setIsLoading(false);
                return;
              }
            }
          }
        } else if (response.ok) {
          const data = await response.json();
          
          let newsData: NewsPost[] = [];
          
          if (data.success && Array.isArray(data.posts)) {
            newsData = data.posts;
          } else if (Array.isArray(data) && data.length > 0) {
            newsData = data;
          } else if (data.data && Array.isArray(data.data)) {
            newsData = data.data;
          } else if (data.posts && Array.isArray(data.posts)) {
            newsData = data.posts;
          }
          
          if (newsData.length > 0) {
            console.log(`API에서 ${newsData.length}개의 뉴스 포스트 가져옴`);
            setPosts(newsData);
            setTotalPosts(data.total || newsData.length);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('뉴스 API 호출 오류:', error);
      }
      
      // 대시보드 API 시도 (백업 방법)
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
          
          if (dashboardData.recentNews && Array.isArray(dashboardData.recentNews) && dashboardData.recentNews.length > 0) {
            console.log(`대시보드에서 ${dashboardData.recentNews.length}개의 뉴스 포스트 가져옴`);
            
            // 대시보드 데이터 형식을 NewsPost 형식으로 변환
            const formattedNews = dashboardData.recentNews.map((post: any) => {
              return {
                _id: post._id || `dashboard-${Math.random().toString(36).substring(7)}`,
                title: post.title || { ko: post.title?.ko || '제목 없음' },
                summary: post.summary || { ko: post.summary?.ko || '요약 없음' },
                slug: post.slug || `news-${Math.random().toString(36).substring(7)}`,
                category: post.category || 'company',
                author: post.author || { 
                  name: '관리자', 
                  department: '뉴스팀' 
                },
                publishDate: post.publishDate || post.publishedAt || post.createdAt || new Date().toISOString(),
                createdAt: post.createdAt || new Date().toISOString(),
                updatedAt: post.updatedAt || new Date().toISOString(),
                viewCount: post.viewCount || 0,
                isPublished: post.isPublished !== false
              };
            });
            
            console.log('대시보드 데이터를 뉴스 형식으로 변환 완료');
            setPosts(formattedNews);
            setTotalPosts(formattedNews.length);
            setIsLoading(false);
            return;
          }
        }
      } catch (dashboardError) {
        console.error('대시보드 API 호출 중 오류:', dashboardError);
      }
      
      // 모든 API 호출 실패 시 샘플 데이터 사용
      console.log('모든 API 요청 실패, 샘플 데이터 사용');
      const sampleData = getSampleNewsPosts();
      setPosts(sampleData);
      setTotalPosts(sampleData.length);
      setIsLoading(false);
    } catch (error) {
      console.error('뉴스 데이터 로드 오류:', error);
      setErrorMessage('뉴스 데이터를 불러오는 중 오류가 발생했습니다.');
      
      // 오류 발생 시 샘플 데이터 표시
      const sampleData = getSampleNewsPosts();
      setPosts(sampleData);
      setTotalPosts(sampleData.length);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 샘플 뉴스 데이터 생성 함수
  const getSampleNewsPosts = (): NewsPost[] => {
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
        summary: {
          ko: '샘플 뉴스 1 요약입니다.',
        },
        slug: 'sample-news-1',
        category: 'company',
        author: {
          name: '홍길동',
          department: '뉴스팀'
        },
        publishDate: new Date().toISOString(),
        isPublished: true,
        viewCount: 42,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: generateMongoId(),
        title: {
          ko: 'ㅁㅇㄴㄹㅇㄴㅁㄹㅇㄹ',
        },
        summary: {
          ko: '샘플 뉴스 2 요약입니다.',
        },
        slug: 'sample-news-2',
        category: 'business',
        author: {
          name: '김철수',
          department: '마케팅팀'
        },
        publishDate: new Date().toISOString(),
        isPublished: true,
        viewCount: 27,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: generateMongoId(),
        title: {
          ko: '랄랄라',
        },
        summary: {
          ko: '샘플 뉴스 3 요약입니다.',
        },
        slug: 'sample-news-3',
        category: 'tech',
        author: {
          name: '이영희',
          department: '기술팀'
        },
        publishDate: new Date().toISOString(),
        isPublished: false,
        viewCount: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  // 삭제 다이얼로그 열기
  const openDeleteDialog = (id: string) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 삭제 실행
  const handleDelete = async () => {
    if (!postToDelete) return;
    
    try {
      // 기본 헤더
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // localStorage에서 토큰 가져오기 (있는 경우에만)
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/posts/news/${postToDelete}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('뉴스 삭제에 실패했습니다.');
      }

      // 성공 메시지와 목록 갱신
      setSuccessMessage('뉴스 포스트가 성공적으로 삭제되었습니다.');
      setPosts(posts.filter(post => post._id !== postToDelete));
      
      // 타이머로 3초 후 메시지 제거
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('뉴스 삭제 오류:', error);
      setErrorMessage('뉴스 포스트 삭제 중 오류가 발생했습니다.');
      
      // 타이머로 3초 후 메시지 제거
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      // 다이얼로그 닫기 및 상태 초기화
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // 메인 페이지 노출 여부 변경
  const handleMainFeaturedChange = async (id: string, isVisible: boolean) => {
    try {
      // UI 먼저 업데이트하여 반응성 향상
      setPosts(prev => 
        prev.map(post => 
          post._id === id 
            ? { ...post, isMainFeatured: isVisible } 
            : post
        )
      );

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 타임아웃 설정 (3초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      console.log(`[디버그] 메인 노출 상태 변경 - ID: ${id}, 값: ${isVisible}`);
      
      const response = await fetch(`/api/posts/news/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isMainFeatured: isVisible }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        // 요청 실패 시 원래 상태로 되돌림
        setPosts(prev => 
          prev.map(post => 
            post._id === id 
              ? { ...post, isMainFeatured: !isVisible } 
              : post
          )
        );
        throw new Error('메인 노출 상태 변경에 실패했습니다.');
      }

      // 성공 메시지 표시
      setSuccessMessage(`메인 노출 상태가 성공적으로 변경되었습니다.`);
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('메인 노출 상태 변경 중 오류:', error);
      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: error instanceof Error ? error.message : '메인 노출 상태 변경 중 오류가 발생했습니다.'
      });
    }
  };

  // 발행 상태 변경 (발행/비발행)
  const handlePublishChange = async (id: string, isPublished: boolean) => {
    try {
      // UI 먼저 업데이트하여 반응성 향상
      setPosts(prev => 
        prev.map(post => 
          post._id === id 
            ? { ...post, isPublished } 
            : post
        )
      );

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 타임아웃 설정 (3초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`/api/posts/news/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isPublished }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        // 요청 실패 시 원래 상태로 되돌림
        setPosts(prev => 
          prev.map(post => 
            post._id === id 
              ? { ...post, isPublished: !isPublished } 
              : post
          )
        );
        throw new Error('발행 상태 변경에 실패했습니다.');
      }

      // 성공 메시지 표시
      setSuccessMessage(`발행 상태가 성공적으로 ${isPublished ? '발행됨' : '미발행됨'}으로 변경되었습니다.`);
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('발행 상태 변경 중 오류:', error);
      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: error instanceof Error ? error.message : '발행 상태 변경 중 오류가 발생했습니다.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">뉴스 관리</h1>
        <Link
          href="/admin/news/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          새 뉴스 작성
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
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-500">뉴스 데이터를 불러오는 중입니다...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대표이미지
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
                    발행 상태
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주요 뉴스
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative h-16 w-16 overflow-hidden rounded">
                        <FallbackImage
                          src={post.imageSource || '/images/news_default.png'}
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
                        <a href={`/notice/news/${post.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {`/notice/news/${post.slug}`}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.publishDate ? format(new Date(post.publishDate), 'yyyy년 MM월 dd일', { locale: ko }) : '날짜 없음'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={categoryColors[post.category] || 'bg-gray-100 text-gray-800'}>
                        {categoryLabels[post.category] || post.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{post.author?.name || '미지정'}</span>
                        <span className="text-xs text-gray-500">{post.author?.department || ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={post.isPublished}
                          onCheckedChange={(checked) => handlePublishChange(post._id, checked)}
                        />
                        <span className="text-xs text-gray-500">
                          {post.isPublished ? (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={post.isMainFeatured || false}
                          onCheckedChange={(checked) => handleMainFeaturedChange(post._id, checked)}
                        />
                        <span className="text-xs text-gray-500">
                          {post.isMainFeatured ? (
                            <div className="flex items-center text-blue-600">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              <span>주요 뉴스</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <AlertCircle className="w-3.5 h-3.5 mr-1" />
                              <span>일반 뉴스</span>
                            </div>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/news/edit/${post._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-5 h-5" />
                          <span className="sr-only">편집</span>
                        </Link>
                        <button
                          onClick={() => openDeleteDialog(post._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="sr-only">삭제</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>등록된 뉴스가 없습니다. 새 뉴스를 작성해보세요.</p>
          </div>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>뉴스 삭제 확인</DialogTitle>
            <DialogDescription>
              이 뉴스 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
