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
  imageSource?: string;
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
      
      // 새로운 ESG API를 사용하여 모든 ESG 게시물 가져오기
      try {
        console.log('새로운 ESG API로 데이터 요청 중...');
        const response = await fetch('/api/esg', {
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
            const retryResponse = await fetch('/api/esg', {
              method: 'GET',
              headers,
              cache: 'no-store'
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              
              if (Array.isArray(data)) {
                console.log(`API에서 ${data.length}개의 ESG 포스트 가져옴`);
                setPosts(data);
                setTotalPosts(data.length);
                setIsLoading(false);
                return;
              }
            }
          }
        } else if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data)) {
            console.log(`API에서 ${data.length}개의 ESG 포스트 가져옴`);
            setPosts(data);
            setTotalPosts(data.length);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('ESG API 호출 오류:', error);
      }
      
      // 백업 방법: 기존 API 시도
      try {
        console.log('기존 API로 데이터 요청');
        
        const fallbackResponse = await fetch('/api/posts/esg?withCounts=true', {
          method: 'GET',
          headers,
          cache: 'no-store'
        });
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          
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
          
          if (esgData.length > 0) {
            console.log(`기존 API에서 ${esgData.length}개의 ESG 포스트 가져옴`);
            setPosts(esgData);
            setTotalPosts(data.total || esgData.length);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('기존 API 호출 오류:', error);
      }
      
      // 모든 방법 실패 시 에러 메시지 표시
      setErrorMessage('ESG 데이터를 가져오는데 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    } catch (error) {
      console.error('ESG 데이터 로드 오류:', error);
      setErrorMessage('오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    
    try {
      setDeleteDialogOpen(false);
      setSuccessMessage('');
      setErrorMessage('');
      setIsLoading(true);
      
      console.log(`ESG 포스트 삭제 시작: ${postToDelete}`);
      
      // API 요청 헤더 설정 (토큰 포함)
      let token = getToken();
      if (!token) {
        token = await refreshToken();
        if (!token) {
          setErrorMessage('인증에 실패했습니다. 다시 로그인해주세요.');
          setIsLoading(false);
          return;
        }
      }
      
      // 새로운 ESG API로 포스트 삭제 요청
      const response = await fetch(`/api/esg?id=${postToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        // 토큰 만료 시 토큰 갱신 후 재시도
        const newToken = await refreshToken();
        if (!newToken) {
          setErrorMessage('세션이 만료되었습니다. 다시 로그인해주세요.');
          setIsLoading(false);
          return;
        }
        
        // 갱신된 토큰으로 재시도
        const retryResponse = await fetch(`/api/esg?id=${postToDelete}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        if (retryResponse.ok) {
          // 성공 시 목록에서 해당 포스트 제거
          setPosts(prevPosts => prevPosts.filter(post => post._id !== postToDelete));
          setTotalPosts(prev => Math.max(0, prev - 1));
          setSuccessMessage('ESG 포스트가 성공적으로 삭제되었습니다.');
          
          toast({
            title: "삭제 완료",
            description: "ESG 포스트가 성공적으로 삭제되었습니다.",
            variant: "default",
          });
        } else {
          const errorData = await retryResponse.json();
          setErrorMessage(errorData.message || '삭제 중 오류가 발생했습니다.');
          
          toast({
            title: "삭제 실패",
            description: errorData.message || '삭제 중 오류가 발생했습니다.',
            variant: "destructive",
          });
        }
      } else if (response.ok) {
        // 성공 시 목록에서 해당 포스트 제거
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postToDelete));
        setTotalPosts(prev => Math.max(0, prev - 1));
        setSuccessMessage('ESG 포스트가 성공적으로 삭제되었습니다.');
        
        toast({
          title: "삭제 완료",
          description: "ESG 포스트가 성공적으로 삭제되었습니다.",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || '삭제 중 오류가 발생했습니다.');
        
        toast({
          title: "삭제 실패",
          description: errorData.message || '삭제 중 오류가 발생했습니다.',
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('ESG 포스트 삭제 오류:', error);
      setErrorMessage('삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
      
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleMainVisibilityChange = async (id: string, isVisible: boolean) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');
      
      let token = getToken();
      if (!token) {
        token = await refreshToken();
        if (!token) {
          setErrorMessage('인증에 실패했습니다. 다시 로그인해주세요.');
          return;
        }
      }
      
      // 새로운 ESG API로 메인 표시 변경 요청
      const response = await fetch(`/api/esg?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isMainFeatured: isVisible })
      });
      
      if (response.status === 401) {
        // 토큰 만료 시 갱신
        const newToken = await refreshToken();
        if (!newToken) {
          setErrorMessage('세션이 만료되었습니다. 다시 로그인해주세요.');
          return;
        }
        
        // 갱신된 토큰으로 다시 시도
        const retryResponse = await fetch(`/api/esg?id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({ isMainFeatured: isVisible })
        });
        
        if (retryResponse.ok) {
          // 성공 시 UI 업데이트
          setPosts(prevPosts => prevPosts.map(post => 
            post._id === id ? { ...post, isMainFeatured: isVisible } : post
          ));
          
          const status = isVisible ? '메인 페이지에 표시' : '메인 페이지에서 숨김';
          setSuccessMessage(`ESG 포스트가 ${status}되었습니다.`);
          
          toast({
            title: "업데이트 완료",
            description: `ESG 포스트가 ${status}되었습니다.`,
            variant: "default",
          });
        } else {
          const errorData = await retryResponse.json();
          setErrorMessage(errorData.message || '업데이트 중 오류가 발생했습니다.');
          
          toast({
            title: "업데이트 실패",
            description: errorData.message || '업데이트 중 오류가 발생했습니다.',
            variant: "destructive",
          });
        }
      } else if (response.ok) {
        // 성공 시 UI 업데이트
        setPosts(prevPosts => prevPosts.map(post => 
          post._id === id ? { ...post, isMainFeatured: isVisible } : post
        ));
        
        const status = isVisible ? '메인 페이지에 표시' : '메인 페이지에서 숨김';
        setSuccessMessage(`ESG 포스트가 ${status}되었습니다.`);
        
        toast({
          title: "업데이트 완료",
          description: `ESG 포스트가 ${status}되었습니다.`,
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || '업데이트 중 오류가 발생했습니다.');
        
        toast({
          title: "업데이트 실패",
          description: errorData.message || '업데이트 중 오류가 발생했습니다.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('ESG 포스트 메인 표시 변경 오류:', error);
      setErrorMessage('업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
      
      toast({
        title: "업데이트 실패",
        description: "업데이트 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handlePublishChange = async (id: string, isPublished: boolean) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');
      
      let token = getToken();
      if (!token) {
        token = await refreshToken();
        if (!token) {
          setErrorMessage('인증에 실패했습니다. 다시 로그인해주세요.');
          return;
        }
      }
      
      // 새로운 ESG API로 발행 상태 변경 요청
      const response = await fetch(`/api/esg?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished })
      });
      
      if (response.status === 401) {
        // 토큰 만료 시 갱신
        const newToken = await refreshToken();
        if (!newToken) {
          setErrorMessage('세션이 만료되었습니다. 다시 로그인해주세요.');
          return;
        }
        
        // 갱신된 토큰으로 다시 시도
        const retryResponse = await fetch(`/api/esg?id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({ isPublished })
        });
        
        if (retryResponse.ok) {
          // 성공 시 UI 업데이트
          setPosts(prevPosts => prevPosts.map(post => 
            post._id === id ? { ...post, isPublished } : post
          ));
          
          const status = isPublished ? '발행' : '미발행';
          setSuccessMessage(`ESG 포스트가 ${status} 상태로 변경되었습니다.`);
          
          toast({
            title: "상태 변경 완료",
            description: `ESG 포스트가 ${status} 상태로 변경되었습니다.`,
            variant: "default",
          });
        } else {
          const errorData = await retryResponse.json();
          setErrorMessage(errorData.message || '상태 변경 중 오류가 발생했습니다.');
          
          toast({
            title: "상태 변경 실패",
            description: errorData.message || '상태 변경 중 오류가 발생했습니다.',
            variant: "destructive",
          });
        }
      } else if (response.ok) {
        // 성공 시 UI 업데이트
        setPosts(prevPosts => prevPosts.map(post => 
          post._id === id ? { ...post, isPublished } : post
        ));
        
        const status = isPublished ? '발행' : '미발행';
        setSuccessMessage(`ESG 포스트가 ${status} 상태로 변경되었습니다.`);
        
        toast({
          title: "상태 변경 완료",
          description: `ESG 포스트가 ${status} 상태로 변경되었습니다.`,
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || '상태 변경 중 오류가 발생했습니다.');
        
        toast({
          title: "상태 변경 실패",
          description: errorData.message || '상태 변경 중 오류가 발생했습니다.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('ESG 포스트 발행 상태 변경 오류:', error);
      setErrorMessage('상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
      
      toast({
        title: "상태 변경 실패",
        description: "상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const getAuthorName = (author: any) => {
    if (!author) return '작성자 없음';
    if (typeof author === 'string') return author;
    if (author.name) return author.name;
    if (author._id) return author._id;
    return '작성자 없음';
  };

  const getAuthorDepartment = (author: any) => {
    if (!author || typeof author === 'string') return '';
    return author.department || '';
  };

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category.toLowerCase()] || category;
  };

  const getCategoryColorClass = (category: string) => {
    return categoryColors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">ESG 컨텐츠 관리</h1>
        <Link href="/admin/esg/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>새 ESG 포스트 작성</span>
          </Button>
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-2">
          <div>
            <h2 className="text-lg font-semibold">ESG 컨텐츠 목록</h2>
            <p className="text-gray-500 text-sm">총 {totalPosts}개의 ESG 포스트</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">데이터를 불러오는 중...</span>
          </div>
        ) : posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발행일</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회수</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메인 표시</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map(post => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Switch
                        checked={post.isPublished}
                        onCheckedChange={(checked) => handlePublishChange(post._id, checked)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {post.thumbnailUrl || post.imageSource ? (
                          <div className="h-12 w-12 flex-shrink-0 mr-3 relative overflow-hidden rounded-md">
                            <FallbackImage 
                              src={post.thumbnailUrl || post.imageSource || ''}
                              alt={post.title.ko}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[250px]">
                            {post.title.ko}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-[250px]">
                            {post.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getCategoryColorClass(post.category)}>
                        {getCategoryLabel(post.category)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{getAuthorName(post.author)}</span>
                        {getAuthorDepartment(post.author) && (
                          <span className="text-xs text-gray-500">{getAuthorDepartment(post.author)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {format(new Date(post.publishDate), 'yyyy.MM.dd', { locale: ko })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {post.viewCount || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Switch
                          checked={post.isMainFeatured || false}
                          onCheckedChange={(checked) => handleMainVisibilityChange(post._id, checked)}
                          className="data-[state=checked]:bg-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-500">
                          {post.isMainFeatured ? '표시' : '숨김'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <a 
                          href={`/notice/esg/${post.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
                          title="새 창에서 보기"
                        >
                          {post.isPublished ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </a>
                        <Link 
                          href={`/admin/esg/edit/${post._id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
                          title="수정하기"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => openDeleteDialog(post._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
                          title="삭제하기"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">ESG 포스트가 없습니다</h3>
            <p className="text-gray-500 mb-6">새 ESG 포스트를 작성해 보세요.</p>
            <Link href="/admin/esg/create">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>새 ESG 포스트 작성</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ESG 포스트 삭제</DialogTitle>
            <DialogDescription>
              이 ESG 포스트를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
