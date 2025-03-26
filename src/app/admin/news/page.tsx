"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllNewsPosts, deleteNewsPost, NewsPost } from '@/lib/models/news-posts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PlusCircle, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const allPosts = getAllNewsPosts();
    setPosts(allPosts);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 뉴스 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        const success = deleteNewsPost(id);
        if (success) {
          setSuccessMessage('뉴스 포스트가 성공적으로 삭제되었습니다.');
          loadPosts();
        } else {
          setErrorMessage('뉴스 포스트 삭제 중 오류가 발생했습니다.');
        }
      } catch (error) {
        setErrorMessage('뉴스 포스트 삭제 중 오류가 발생했습니다.');
        console.error(error);
      }
    }
  };

  const handleMainVisibilityChange = async (id: string, isVisible: boolean) => {
    try {
      await fetch(`/api/news/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showOnHomepage: isVisible }),
      })
      
      // 상태 업데이트
      setPosts(posts.map(item => 
        item.id === id ? { ...item, showOnHomepage: isVisible } : item
      ))
      
      toast({
        title: '업데이트 완료',
        description: `메인 노출 상태가 ${isVisible ? '활성화' : '비활성화'}되었습니다.`,
      })
    } catch (error) {
      console.error('메인 노출 상태 업데이트 실패:', error)
      toast({
        title: '오류 발생',
        description: '메인 노출 상태 업데이트에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

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
                    주요뉴스
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative h-14 w-24 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={post.imageSrc}
                          alt={post.title.ko}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{post.title.ko}</div>
                      <div className="text-sm text-gray-500">{post.title.en}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(post.date), 'yyyy년 MM월 dd일', { locale: ko })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${post.category === 'company' ? 'bg-blue-100 text-blue-800' : ''}
                        ${post.category === 'award' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${post.category === 'partnership' ? 'bg-green-100 text-green-800' : ''}
                        ${post.category === 'product' ? 'bg-purple-100 text-purple-800' : ''}
                      `}>
                        {post.category === 'company' && '회사소식'}
                        {post.category === 'award' && '수상'}
                        {post.category === 'partnership' && '파트너십'}
                        {post.category === 'product' && '제품'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.featured ? '✓' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/news/edit/${post.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-5 h-5" />
                          <span className="sr-only">편집</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
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
    </div>
  );
}
