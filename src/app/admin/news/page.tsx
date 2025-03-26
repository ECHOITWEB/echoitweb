"use client";

import React, { useState, useEffect } from 'react';
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
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// 토큰을 가져오는 함수
function getToken() {
  // 직접 localStorage에서 시도
  const directToken = localStorage.getItem('accessToken');
  if (directToken) return directToken;
  
  // 세션 유틸리티에서 시도
  try {
    const sessionStr = localStorage.getItem('echoit_auth_token');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.accessToken) return session.accessToken;
    }
  } catch (e) {
    console.error('세션 파싱 오류:', e);
  }
  
  return null;
}

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  // MongoDB에서 뉴스 데이터 로드
  const loadPosts = async () => {
    setLoading(true);
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

      const response = await fetch('/api/posts/news', {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('뉴스 데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('뉴스 로딩 오류:', error);
      setErrorMessage('뉴스 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
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
  const handleVisibilityChange = async (id: string, isVisible: boolean) => {
    try {
      console.log(`[디버그] 노출 상태 변경 요청 시작 - ID: ${id}, 노출 여부: ${isVisible}`);

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
      console.log('[디버그] API 요청 본문:', { isPublished: isVisible });

      const response = await fetch(`/api/posts/news/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isPublished: isVisible }),
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
      setPosts(posts.map(post => 
        post._id === id ? { ...post, isPublished: isVisible } : post
      ));
      
      toast({
        title: '업데이트 완료',
        description: `메인 노출 상태가 ${isVisible ? '활성화' : '비활성화'}되었습니다.`,
      });
    } catch (error: any) {
      console.error('[디버그] 메인 노출 상태 업데이트 실패:', error);
      
      toast({
        title: '오류 발생',
        description: error.message || '메인 노출 상태 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
      
      // 오류 발생 시에도 UI 반영을 위해 즉시 데이터 다시 로드
      loadPosts();
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
        {loading ? (
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
                    메인 노출
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
                      <div className="relative h-14 w-24 bg-gray-100 rounded overflow-hidden">
                        {post.imageSource ? (
                          <Image
                            src={post.imageSource}
                            alt={post.title.ko}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400 text-xs">
                            이미지 없음
                          </div>
                        )}
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
                          onCheckedChange={(checked) => handleVisibilityChange(post._id, checked)}
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
