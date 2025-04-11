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
import { AdminLayout } from '@/components/ui/admin-layout';

// ESG 카테고리 한글 표시
const categoryLabels: Record<string, string> = {
  'environment': '환경',
  'social': '사회',
  'governance': '지배구조',
  'sustainability': '지속가능성',
  'report': '보고서',
  'other': '기타'
};

// ESG 카테고리별 배지 색상
const categoryColors: Record<string, string> = {
  'environment': 'bg-green-100 text-green-800',
  'social': 'bg-blue-100 text-blue-800',
  'governance': 'bg-purple-100 text-purple-800',
  'sustainability': 'bg-yellow-100 text-yellow-800',
  'report': 'bg-indigo-100 text-indigo-800',
  'other': 'bg-gray-100 text-gray-800'
};

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
  imageSource?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    original?: string;
  } | string;
  viewCount: number;
  isPublished: boolean;
  isMainFeatured?: boolean;
  updatedAt?: string;
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

// 현재 로그인한 사용자 정보 가져오기
const getCurrentUserInfo = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('echoit_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error('사용자 정보 가져오기 오류:', e);
  }
  
  return null;
};

export default function AdminESGPage() {
  const [posts, setPosts] = useState<ESGPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    loadPosts();
  }, []);

  // loadPosts 함수 개선
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      console.log('ESG 데이터 로드 시작');
      
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

      // 현재 로그인한 사용자 정보가 없으면 가져오기
      const userInfo = getCurrentUserInfo();
      if (!userInfo && token) {
        try {
          const userResponse = await fetch('/api/auth/me', {
            method: 'GET',
            headers
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success && userData.user) {
              // 사용자 정보를 로컬 스토리지에 저장
              localStorage.setItem('echoit_user', JSON.stringify(userData.user));
              console.log('사용자 정보를 로컬 스토리지에 저장했습니다.');
            }
          }
        } catch (error) {
          console.error('사용자 정보 가져오기 오류:', error);
        }
      }
      
      // 모든 ESG 포스트 가져오기 (발행 및 미발행 포함)
      try {
        console.log('ESG 데이터 요청 중...');
        const response = await fetch('/api/posts/esg?withCounts=true', {
          method: 'GET',
          headers,
          cache: 'no-store',
          next: { revalidate: 0 }
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
              cache: 'no-store',
              next: { revalidate: 0 }
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              console.log('ESG API 갱신된 토큰 응답 데이터:', JSON.stringify(data).substring(0, 200) + '...');
              
              let esgData: ESGPost[] = [];
              
              if (data.success && Array.isArray(data.posts)) {
                esgData = data.posts;
              } else if (Array.isArray(data) && data.length > 0) {
                esgData = data;
              } else if (data.data && Array.isArray(data.data)) {
                esgData = data.data;
              } else if (data.posts && Array.isArray(data.posts)) {
                esgData = data.posts;
              }
              
              console.log('파싱된 ESG 데이터 길이:', esgData.length);
              // 데이터가 비어있더라도 표시하도록 수정
              setPosts(esgData);
              setTotalPosts(data.total || esgData.length);
              setIsLoading(false);
              setErrorMessage('');
              return;
            } else {
              console.log('ESG API 재시도 실패:', retryResponse.status, retryResponse.statusText);
            }
          }
        } else if (response.ok) {
          const data = await response.json();
          console.log('ESG API 응답 데이터:', JSON.stringify(data).substring(0, 200) + '...');
          
          let esgData: ESGPost[] = [];
          
          if (data.success && Array.isArray(data.posts)) {
            esgData = data.posts;
          } else if (Array.isArray(data) && data.length > 0) {
            esgData = data;
          } else if (data.data && Array.isArray(data.data)) {
            esgData = data.data;
          } else if (data.posts && Array.isArray(data.posts)) {
            esgData = data.posts;
          }
          
          console.log('파싱된 ESG 데이터 길이:', esgData.length);
          // 데이터가 비어있더라도 표시하도록 수정
          setPosts(esgData);
          setTotalPosts(data.total || esgData.length);
          setIsLoading(false);
          setErrorMessage('');
          return;
        } else {
          console.log('ESG API 오류 상태:', response.status, response.statusText);
          try {
            const errorData = await response.json();
            console.log('ESG API 오류 응답:', errorData);
          } catch (e) {
            console.log('ESG API 오류 응답을 파싱할 수 없음:', e);
          }
        }
      } catch (error) {
        console.error('ESG API 호출 오류:', error);
      }
      
      setIsLoading(false);
      setErrorMessage('ESG 데이터를 가져오는데 실패했습니다. 다시 시도해주세요.');
    } catch (error) {
      console.error('ESG 데이터 로드 중 오류 발생:', error);
      setIsLoading(false);
      setErrorMessage('ESG 데이터를 가져오는데 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 삭제 다이얼로그 열기
  const openDeleteDialog = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  // 삭제 실행
  const handleDelete = async () => {
    if (!postToDelete) return;
    
    try {
      setIsLoading(true);
      
      // API 요청 헤더 설정 (토큰 포함)
      let token = getToken();
      
      // API 요청 헤더 설정
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/posts/esg/${postToDelete}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.ok) {
        // 삭제 성공
        setPosts(posts.filter(post => post._id !== postToDelete));
        setTotalPosts(prev => prev - 1);
        
        // 페이지 데이터 완전 새로고침
        setTimeout(() => {
          loadPosts();
        }, 500);
        
        setSuccessMessage('ESG 포스트가 성공적으로 삭제되었습니다.');
        toast({
          title: "포스트 삭제 완료",
          description: "ESG 포스트가 성공적으로 삭제되었습니다.",
          variant: "default",
        });
      } else {
        // 삭제 실패
        const errorData = await response.json();
        setErrorMessage(errorData.message || '포스트 삭제 중 오류가 발생했습니다.');
        toast({
          title: "삭제 실패",
          description: errorData.message || '포스트 삭제 중 오류가 발생했습니다.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('ESG 포스트 삭제 중 오류:', error);
      setErrorMessage('포스트 삭제 중 오류가 발생했습니다.');
      toast({
        title: "삭제 실패",
        description: '포스트 삭제 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // 발행 상태 토글
  const togglePublishStatus = async (post: ESGPost) => {
    try {
      // API 요청 헤더 설정 (토큰 포함)
      let token = getToken();
      
      // API 요청 헤더 설정
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/posts/esg/${post._id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isPublished: !post.isPublished })
      });
      
      if (response.ok) {
        // 상태 업데이트 성공
        const updatedPosts = posts.map(p =>
          p._id === post._id ? { ...p, isPublished: !p.isPublished } : p
        );
        setPosts(updatedPosts);
        
        // 페이지 데이터 새로고침
        setTimeout(() => {
          loadPosts();
        }, 500);
        
        // 토스트 메시지 표시
        toast({
          title: post.isPublished ? "비공개로 변경됨" : "발행 상태로 변경됨",
          description: `"${post.title.ko}" 포스트가 ${post.isPublished ? '비공개' : '공개'} 상태로 변경되었습니다.`,
          variant: "default",
        });
      } else {
        // 상태 업데이트 실패
        const errorData = await response.json();
        toast({
          title: "상태 변경 실패",
          description: errorData.message || '포스트 상태 변경 중 오류가 발생했습니다.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('ESG 포스트 상태 변경 중 오류:', error);
      toast({
        title: "상태 변경 실패",
        description: '포스트 상태 변경 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    }
  };

  // 주요 뉴스 토글
  const toggleMainFeatured = async (post: ESGPost) => {
    try {
      // API 요청 헤더 설정 (토큰 포함)
      let token = getToken();
      
      // API 요청 헤더 설정
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/posts/esg/${post._id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isMainFeatured: !post.isMainFeatured })
      });
      
      if (response.ok) {
        // 상태 업데이트 성공
        const updatedPosts = posts.map(p =>
          p._id === post._id ? { ...p, isMainFeatured: !p.isMainFeatured } : p
        );
        setPosts(updatedPosts);
        
        // 페이지 데이터 새로고침
        setTimeout(() => {
          loadPosts();
        }, 500);
        
        // 토스트 메시지 표시
        toast({
          title: post.isMainFeatured ? "주요 콘텐츠에서 제거됨" : "주요 콘텐츠로 설정됨",
          description: `"${post.title.ko}" 포스트가 ${post.isMainFeatured ? '일반' : '주요'} 콘텐츠로 변경되었습니다.`,
          variant: "default",
        });
      } else {
        // 상태 업데이트 실패
        const errorData = await response.json();
        toast({
          title: "상태 변경 실패",
          description: errorData.message || '포스트 상태 변경 중 오류가 발생했습니다.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('ESG 포스트 주요 상태 변경 중 오류:', error);
      toast({
        title: "상태 변경 실패",
        description: '포스트 상태 변경 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    }
  };

  // 작성자 이름 표시 처리
  const getAuthorName = (author: any): string => {
    if (!author) return '미지정';
    
    // "current_user"인 경우 현재 사용자 정보 반환
    if (author === 'current_user') {
      const currentUser = getCurrentUserInfo();
      if (currentUser) {
        if (currentUser.name && typeof currentUser.name === 'object') {
          const firstName = currentUser.name.first || '';
          const lastName = currentUser.name.last || '';
          const fullName = `${firstName} ${lastName}`.trim();
          return fullName || currentUser.username || '현재 사용자';
        }
        if (currentUser.name) {
          return currentUser.name;
        }
        return currentUser.username || '현재 사용자';
      }
      return '현재 사용자';
    }
    
    // 문자열 형태로 저장된 작성자 정보 처리
    if (typeof author === 'string') {
      try {
        // JSON 문자열인지 확인
        const parsedAuthor = JSON.parse(author);
        if (parsedAuthor) {
          if (parsedAuthor.name) {
            return parsedAuthor.name;
          }
          // 이름이 없고 사용자명이 있는 경우
          if (parsedAuthor.username) return parsedAuthor.username;
        }
      } catch (e) {
        // JSON이 아닌 경우는 그대로 반환
        return author;
      }
    }
    
    // 객체 형태로 저장된 작성자 정보 처리
    if (typeof author === 'object' && author !== null) {
      // name이 있는 경우
      if (author.name) {
        return author.name;
      }
      
      // username만 있는 경우
      if (author.username) {
        return author.username;
      }
    }
    
    return '미지정';
  };

  // 작성자 역할 표시 처리
  const getAuthorRole = (author: any): string => {
    if (!author) return '';
    
    // "current_user"인 경우 현재 사용자 정보 반환
    if (author === 'current_user') {
      const currentUser = getCurrentUserInfo();
      if (currentUser && currentUser.role) {
        return currentUser.role === 'admin' ? '관리자' : 
               currentUser.role === 'editor' ? '편집자' : '조회자';
      }
      return '';
    }
    
    // 문자열 형태로 저장된 작성자 정보 처리
    if (typeof author === 'string') {
      try {
        // JSON 문자열인지 확인
        const parsedAuthor = JSON.parse(author);
        if (parsedAuthor && parsedAuthor.role) {
          return parsedAuthor.role === 'admin' ? '관리자' : 
                 parsedAuthor.role === 'editor' ? '편집자' : '조회자';
        }
      } catch (e) {
        // JSON이 아닌 경우 빈 문자열 반환
        return '';
      }
    }
    
    // 객체 형태로 저장된 작성자 정보 처리
    if (typeof author === 'object' && author !== null && author.role) {
      return author.role === 'admin' ? '관리자' : 
             author.role === 'editor' ? '편집자' : '조회자';
    }
    
    return '';
  };

  // 작성자 부서 표시 처리 - 더 이상 사용하지 않음
  const getAuthorDepartment = (author: any): string => {
    return '';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">ESG 콘텐츠 관리</h1>
          <Link href="/admin/esg/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            ESG 콘텐츠 생성
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto max-w-[calc(100vw-2rem)]">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대표이미지
                  </th>
                  <th scope="col" className="w-[40%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th scope="col" className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th scope="col" className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th scope="col" className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성자
                  </th>
                  <th scope="col" className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    발행 상태
                  </th>
                  <th scope="col" className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주요 뉴스
                  </th>
                  <th scope="col" className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center h-12 w-12 overflow-hidden rounded-md">
                        {(post.thumbnailUrl || (post.imageSource && typeof post.imageSource === 'object' && post.imageSource.thumbnail)) ? (
                          <FallbackImage
                            src={typeof post.imageSource === 'object' && post.imageSource.thumbnail 
                                ? post.imageSource.thumbnail 
                                : post.thumbnailUrl || '/images/placeholder-esg.jpg'}
                            alt={post.title.ko}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                            fallbackSrc="/images/placeholder-esg.jpg"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-200 text-gray-400">
                            <span className="text-xs">이미지 없음</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        <Link href={`/admin/esg/edit/${post._id}`} className="hover:text-indigo-600">
                          {post.title.ko}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(post.publishDate || post.createdAt), 'yyyy.MM.dd', { locale: ko })}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <Badge className={categoryColors[post.category] || "bg-gray-100 text-gray-800"}>
                        {categoryLabels[post.category] || post.category}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{getAuthorName(post.author)}</div>
                        <div className="text-xs text-gray-500">{getAuthorRole(post.author)}</div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={post.isPublished}
                          onCheckedChange={() => togglePublishStatus(post)}
                        />
                        <span className="text-sm text-gray-500">
                          {post.isPublished ? '발행됨' : '비공개'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={post.isMainFeatured || false}
                          onCheckedChange={() => toggleMainFeatured(post)}
                        />
                        <span className="text-sm text-gray-500">
                          {post.isMainFeatured ? '주요' : '일반'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/admin/esg/edit/${post._id}`}>
                          <Button variant="outline" size="sm" className="px-2 py-1">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="px-2 py-1 text-red-600 hover:text-red-800" 
                          onClick={() => openDeleteDialog(post._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 삭제 확인 대화상자 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ESG 포스트 삭제</DialogTitle>
            <DialogDescription>
              이 ESG 포스트를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={postToDelete === null}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
