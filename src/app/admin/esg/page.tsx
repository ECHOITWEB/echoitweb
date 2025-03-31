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

  const handleDelete = async (id: string) => {
    try {
      setDeleteDialogOpen(false);
      setSuccessMessage('');
      setErrorMessage('');
      
      console.log(`ESG 포스트 삭제 시작: ${id}`);
      
      // API 요청 헤더 설정 (토큰 포함)
      let token = getToken();
      if (!token) {
        token = await refreshToken();
        if (!token) {
          setErrorMessage('인증에 실패했습니다. 다시 로그인해주세요.');
          return;
        }
      }
      
      // 새로운 ESG API로 포스트 삭제 요청
      const response = await fetch(`/api/esg?id=${id}`, {
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
          return;
        }
        
        // 갱신된 토큰으로 재시도
        const retryResponse = await fetch(`/api/esg?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        if (retryResponse.ok) {
          // 성공 시 목록에서 해당 포스트 제거
          setPosts(prevPosts => prevPosts.filter(post => post._id !== id));
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
        setPosts(prevPosts => prevPosts.filter(post => post._id !== id));
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
    } catch (error) {
      console.error('ESG 포스트 삭제 오류:', error);
      setErrorMessage('삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      
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

  // 삭제 대화 상자 열기
  const openDeleteDialog = (id: string) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 작성자 이름 가져오기
  const getAuthorName = (author: any) => {
    if (!author) return '미지정';
    if (typeof author === 'string') return author;
    if (author.name) return author.name;
    return '미지정';
  };

  // 작성자 부서 가져오기
  const getAuthorDepartment = (author: any) => {
    if (!author) return '';
    if (typeof author === 'object' && author.department) return author.department;
    return '';
  };

  // 카테고리 레이블 가져오기
  const getCategoryLabel = (category: string) => {
    return categoryLabels[category] || category;
  };

  // 카테고리 색상 클래스 가져오기
  const getCategoryColorClass = (category: string) => {
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-2">ESG 게시물 관리</h1>
          <Link href="/admin/esg/create" passHref>
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              새 ESG 게시물
            </Button>
          </Link>
        </div>
        
        <p className="text-gray-500">
          {isLoading ? '로딩 중...' : 
            totalPosts > 0 ? `총 ${totalPosts}개의 ESG 게시물` : '게시물이 없습니다.'}
        </p>
      </header>

      {/* 성공 메시지 표시 */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
          <CheckCircle className="mr-2 h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* 에러 메시지 표시 */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle className="mr-2 h-5 w-5" />
          {errorMessage}
        </div>
      )}

      {/* 로딩 상태 표시 */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-500">ESG 게시물 로딩 중...</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">게시물이 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">
            새 ESG 게시물을 추가하려면 위의 "새 ESG 게시물" 버튼을 클릭하세요.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">카테고리</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">제목</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">작성자</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">작성일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">조회수</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">메인 노출</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">상태</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 align-middle">
                    <Badge className={getCategoryColorClass(post.category)}>
                      {getCategoryLabel(post.category)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      {post.imageSource && (
                        <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border">
                          <FallbackImage
                            src={post.imageSource || post.thumbnailUrl || '/images/placeholder.jpg'}
                            alt={post.title.ko}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Link href={`/admin/esg/edit/${post._id}`} className="text-blue-600 hover:underline">
                        {post.title.ko}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div>
                      <div className="font-medium text-sm">{getAuthorName(post.author)}</div>
                      {getAuthorDepartment(post.author) && (
                        <div className="text-xs text-gray-500">{getAuthorDepartment(post.author)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm">
                    {post.publishDate
                      ? format(new Date(post.publishDate), 'yyyy.MM.dd', { locale: ko })
                      : format(new Date(post.createdAt), 'yyyy.MM.dd', { locale: ko })}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-center">
                    {post.viewCount || 0}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Switch
                      checked={!!post.isMainFeatured}
                      onCheckedChange={(checked) => handleMainVisibilityChange(post._id, checked)}
                    />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!post.isPublished}
                        onCheckedChange={(checked) => handlePublishChange(post._id, checked)}
                      />
                      <span className="text-sm">
                        {post.isPublished ? (
                          <span className="flex items-center text-green-600">
                            <Eye size={16} className="mr-1" /> 발행됨
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500">
                            <EyeOff size={16} className="mr-1" /> 비공개
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-center gap-2">
                      <Link href={`/admin/esg/edit/${post._id}`} passHref>
                        <Button variant="ghost" size="icon" title="수정">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="삭제"
                        onClick={() => openDeleteDialog(post._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 삭제 확인 대화 상자 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ESG 게시물 삭제 확인</DialogTitle>
            <DialogDescription>
              이 ESG 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
              onClick={() => postToDelete && handleDelete(postToDelete)}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
