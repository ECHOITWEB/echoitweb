"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { useForm, Controller } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, Check, Edit, Loader2 } from 'lucide-react';

// 뉴스 카테고리 목록
const CATEGORIES = [
  { value: 'company', label: '회사소식' },
  { value: 'product', label: '제품' },
  { value: 'award', label: '수상' },
  { value: 'media', label: '미디어' },
  { value: 'event', label: '이벤트' },
  { value: 'other', label: '기타' }
];

// 작성자 부서 목록
const DEPARTMENTS = [
  { value: 'ESG 경영팀', label: 'ESG 경영팀' },
  { value: '사회공헌팀', label: '사회공헌팀' },
  { value: '기술연구소', label: '기술연구소' },
  { value: '인사팀', label: '인사팀' },
  { value: '운영자', label: '운영자' },
  { value: '편집자', label: '편집자' },
  { value: '일반 사용자', label: '일반 사용자' },
  { value: '직접 입력', label: '직접 입력' }
];

// 폼 데이터 타입 정의
interface FormData {
  title: {
    ko: string;
    en: string;
  };
  summary: {
    ko: string;
    en: string;
  };
  content: {
    ko: string;
    en: string;
  };
  category: string;
  author: {
    department: string;
    name: string;
  };
  publishDate: string;
  imageSource: string;
  isPublished: boolean;
  isMainFeatured: boolean;
}

// 토큰을 가져오는 함수
function getToken() {
  // localStorage에서 토큰 시도
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) return token;
    
    try {
      const sessionStr = localStorage.getItem('echoit_auth_token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.accessToken) return session.accessToken;
      }
    } catch (e) {
      console.error('세션 파싱 오류:', e);
    }
  }
  
  return null;
}

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('ko');

  // React Hook Form 설정
  const form = useForm<FormData>({
    defaultValues: {
      title: { ko: '', en: '' },
      summary: { ko: '', en: '' },
      content: { ko: '', en: '' },
      category: 'company',
      author: {
        department: '운영자',
        name: ''
      },
      publishDate: new Date().toISOString().substring(0, 10),
      imageSource: '',
      isPublished: false,
      isMainFeatured: false
    }
  });

  // 데이터 로드
  useEffect(() => {
    async function loadNewsData() {
      setIsLoading(true);
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

        const response = await fetch(`/api/posts/news/${newsId}`, { headers });
        
        if (!response.ok) {
          throw new Error('뉴스 데이터를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        const post = data.post;
        
        if (!post) {
          throw new Error('뉴스 데이터가 없습니다.');
        }
        
        console.log('[디버그] 로드된 뉴스 데이터:', post);
        
        // 날짜 포맷팅
        const publishDate = post.publishDate 
          ? new Date(post.publishDate).toISOString().substring(0, 10)
          : new Date().toISOString().substring(0, 10);
        
        // 폼 데이터 설정
        form.reset({
          title: {
            ko: post.title?.ko || '',
            en: post.title?.en || ''
          },
          summary: {
            ko: post.summary?.ko || '',
            en: post.summary?.en || ''
          },
          content: {
            ko: post.content?.ko || '',
            en: post.content?.en || ''
          },
          category: post.category || 'company',
          author: {
            department: post.author?.department || '운영자',
            name: post.author?.name || ''
          },
          publishDate,
          imageSource: post.imageSource || '',
          isPublished: post.isPublished || false,
          isMainFeatured: post.isMainFeatured || false
        });
        
        setErrorMessage('');
      } catch (error) {
        console.error('뉴스 로딩 오류:', error);
        setErrorMessage('뉴스 데이터를 불러오는데 실패했습니다.');
        toast({
          title: "데이터 로딩 실패",
          description: "뉴스 데이터를 불러오는데 실패했습니다.",
          variant: "destructive",
          action: <ToastAction altText="다시 시도">다시 시도</ToastAction>,
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    if (newsId) {
      loadNewsData();
    }
  }, [newsId, form]);

  // 폼 제출 처리
  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
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

      console.log('[디버그] 뉴스 수정 요청 데이터:', data);
      
      const response = await fetch(`/api/posts/news/${newsId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '뉴스 업데이트에 실패했습니다.');
      }
      
      const result = await response.json();
      console.log('[디버그] 뉴스 수정 결과:', result);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      toast({
        title: "저장 성공",
        description: "뉴스 내용이 성공적으로 저장되었습니다.",
      });
    } catch (error: any) {
      console.error('뉴스 저장 오류:', error);
      setErrorMessage(error.message || '뉴스 저장 중 오류가 발생했습니다.');
      
      toast({
        title: "저장 실패",
        description: error.message || '뉴스 저장 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 목록으로 돌아가기
  const handleGoBack = () => {
    router.push('/admin/news');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">뉴스 데이터를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">뉴스 수정</h1>
        <Button 
          variant="outline" 
          onClick={handleGoBack}
        >
          목록으로 돌아가기
        </Button>
      </div>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {showSuccess && (
        <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">저장 완료</AlertTitle>
          <AlertDescription className="text-green-700">
            뉴스 내용이 성공적으로 저장되었습니다.
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="ko" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-2">
              <TabsList>
                <TabsTrigger value="ko">한국어</TabsTrigger>
                <TabsTrigger value="en">영어</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={form.watch('isPublished')}
                    onCheckedChange={(checked) => form.setValue('isPublished', checked)}
                  />
                  <Label htmlFor="isPublished">
                    {form.watch('isPublished') ? '공개 중' : '비공개'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isMainFeatured"
                    checked={form.watch('isMainFeatured')}
                    onCheckedChange={(checked) => form.setValue('isMainFeatured', checked)}
                  />
                  <Label htmlFor="isMainFeatured">
                    {form.watch('isMainFeatured') ? '메인 노출' : '메인 비노출'}
                  </Label>
                </div>
              </div>
            </div>
            
            <TabsContent value="ko" className="space-y-6">
              <FormField
                control={form.control}
                name="title.ko"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목 (한국어) *</FormLabel>
                    <FormControl>
                      <Input placeholder="제목을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="summary.ko"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>요약 (한국어) *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="뉴스 요약을 입력하세요" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content.ko"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용 (한국어) *</FormLabel>
                    <FormControl>
                      <Controller
                        name="content.ko"
                        control={form.control}
                        render={({ field }) => (
                          <Editor
                            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                            value={field.value}
                            onEditorChange={(content: string) => field.onChange(content)}
                            init={{
                              height: 500,
                              menubar: true,
                              plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                              ],
                              toolbar:
                                'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                            }}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="en" className="space-y-6">
              <FormField
                control={form.control}
                name="title.en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="summary.en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary (English)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter news summary" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content.en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (English)</FormLabel>
                    <FormControl>
                      <Controller
                        name="content.en"
                        control={form.control}
                        render={({ field }) => (
                          <Editor
                            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                            value={field.value}
                            onEditorChange={(content: string) => field.onChange(content)}
                            init={{
                              height: 500,
                              menubar: true,
                              plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                              ],
                              toolbar:
                                'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                            }}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리 *</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="publishDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>발행일 *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="author.department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>작성자 부서 *</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="부서 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="author.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>작성자 이름 *</FormLabel>
                  <FormControl>
                    <Input placeholder="작성자 이름" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="imageSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이미지 URL</FormLabel>
                <FormControl>
                  <Input placeholder="이미지 URL을 입력하세요" {...field} />
                </FormControl>
                <FormDescription>
                  뉴스 썸네일로 사용될 이미지의 URL을 입력하세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoBack}
            >
              취소
            </Button>
            <Button 
              type="submit"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 