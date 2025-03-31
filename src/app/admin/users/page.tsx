"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/context/auth-context';
import apiClient from '@/lib/auth/api-client';
import { Eye, EyeOff, Trash, UserPlus, CheckCircle, XCircle, Pencil, Save, Shield } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface NameObject {
  first: string;
  last: string;
}

// 이름 객체 타입 가드
function isNameObject(name: any): name is NameObject {
  return typeof name === 'object' && name !== null && 'first' in name;
}

// 안전하게 name.first에 접근하는 헬퍼 함수
function getFirstName(name: NameObject | string): string {
  return isNameObject(name) ? name.first : name;
}

// 안전하게 name.last에 접근하는 헬퍼 함수
function getLastName(name: NameObject | string): string {
  return isNameObject(name) ? name.last : '';
}

// 새로운 이름 객체 생성 헬퍼 함수
function createNameObject(value: string): NameObject {
  return { first: value, last: '' };
}

interface ExtendedUserInfo {
  id: string;
  username: string;
  email: string;
  name: NameObject | string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  password?: string;
  avatar?: string;
  updatedAt: string;
}

// 새 사용자 정의 인터페이스 - name을 항상 NameObject로 처리
interface NewUserForm {
  username: string;
  email: string;
  name: NameObject;
  password: string;
  role: UserRole;
}

// API 응답 인터페이스 정의
interface UsersApiResponse {
  success: boolean;
  message?: string;
  users?: ExtendedUserInfo[];
  data?: {
    users?: ExtendedUserInfo[];
  };
}

const UserRoleNames: Record<UserRole, string> = {
  'admin': '관리자',
  'editor': '편집자',
  'viewer': '조회자'
};

const UserRoleColors: Record<UserRole, string> = {
  'admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'editor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'viewer': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
};

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ExtendedUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState<ExtendedUserInfo | null>(null);

  // 새 사용자 폼
  const [newUser, setNewUser] = useState<NewUserForm>({
    username: '',
    email: '',
    name: {
      first: '',
      last: ''
    },
    password: '',
    role: 'viewer' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);

  // 컴포넌트 상단에 토큰 갱신 함수 추가
  const refreshToken = async (): Promise<string | null> => {
    try {
      console.log('토큰 갱신 시도 중...');
      
      // 로컬 스토리지에서 리프레시 토큰 가져오기
      const sessionStr = localStorage.getItem('echoit_auth_token');
      if (!sessionStr) {
        console.error('저장된 인증 정보가 없습니다.');
        return null;
      }
      
      let refreshTokenValue = null;
      try {
        const session = JSON.parse(sessionStr);
        refreshTokenValue = session?.refreshToken;
        
        if (!refreshTokenValue) {
          console.error('리프레시 토큰이 없습니다.');
          return null;
        }
      } catch (e) {
        console.error('세션 파싱 오류:', e);
        return null;
      }
      
      // 토큰 갱신 요청
      console.log('토큰 갱신 API 요청 시작');
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
        credentials: 'include',
        cache: 'no-store' // 캐시 방지
      });
      
      console.log('토큰 갱신 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        // 오류 응답 로깅
        try {
          const errorText = await response.text();
          console.error('토큰 갱신 오류 응답:', errorText);
        } catch (e) {
          console.error('토큰 갱신 오류 응답 파싱 실패');
        }
        throw new Error(`토큰 갱신 실패: ${response.status}`);
      }
      
      // 응답 데이터 로깅
      const responseText = await response.text();
      console.log('토큰 갱신 응답 데이터:', responseText);
      
      // JSON 파싱
      const data = responseText ? JSON.parse(responseText) : {};
      
      console.log('파싱된 토큰 데이터:', data);
      
      if (data.success && data.accessToken) {
        // 로컬 스토리지에 새 토큰 저장
        const sessionStr = localStorage.getItem('echoit_auth_token');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            session.accessToken = data.accessToken;
            // 리프레시 토큰도 새로 갱신되었다면 저장
            if (data.refreshToken) {
              session.refreshToken = data.refreshToken;
            }
            localStorage.setItem('echoit_auth_token', JSON.stringify(session));
            console.log('토큰 갱신 성공, 로컬 스토리지 업데이트 완료');
            return data.accessToken;
          } catch (e) {
            console.error('세션 업데이트 오류:', e);
          }
        }
      } else {
        console.error('토큰 갱신 응답에 accessToken이 없음:', data);
      }
      
      return null;
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
      return null;
    }
  };
  
  // getAuthHeader 함수 추가
  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (typeof window !== 'undefined') {
      let token = null;
      const sessionStr = localStorage.getItem('echoit_auth_token');
      
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          token = session?.accessToken;
        } catch (e) {
          console.error('토큰 파싱 오류:', e);
        }
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  };

  // 사용자 목록 가져오기
  const fetchUsers = async (attemptTokenRefresh = true) => {
    setLoading(true);
    setError('');
    try {
      const headers = await getAuthHeader();
      console.log('사용자 목록 요청 헤더:', headers);
      
      const response = await fetch('/api/users', {
        method: 'GET',
        headers,
        cache: 'no-store'
      });
      
      console.log('API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('API 응답 오류:', response.status, response.statusText);
        
        // 토큰 디버깅을 위한 추가 정보
        const sessionStr = localStorage.getItem('echoit_auth_token');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            console.log('저장된 토큰 정보:', {
              accessToken: session.accessToken ? `${session.accessToken.substring(0, 10)}...` : 'none',
              refreshToken: session.refreshToken ? `${session.refreshToken.substring(0, 10)}...` : 'none'
            });
          } catch (e) {
            console.error('토큰 디버깅 오류:', e);
          }
        }
        
        // 401 에러(인증 만료)면 토큰 갱신 후 재시도
        if (response.status === 401 && attemptTokenRefresh) {
          console.log('401 오류 발생, 토큰 갱신 시도');
          const refreshed = await refreshToken();
          if (refreshed) {
            console.log('토큰 갱신 성공, 요청 재시도');
            return fetchUsers(false); // 재귀 호출 시 토큰 갱신 시도 방지
          } else {
            throw new Error('토큰 갱신에 실패했습니다.');
          }
        }
        
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
      }
      
      // 응답 내용 로깅 (디버깅 용도)
      const responseText = await response.text();
      console.log('API 응답 데이터:', responseText);
      
      // JSON으로 다시 파싱
      const data = responseText ? JSON.parse(responseText) : {};
      
      console.log('파싱된 사용자 데이터:', data);
      
      if (!data || !data.users || !Array.isArray(data.users)) {
        console.error('유효하지 않은 사용자 데이터:', data);
        setUsers([]);
        setLoading(false);
        setError('유효하지 않은 사용자 데이터 형식입니다.');
        return;
      }
      
      // 사용자 데이터 처리 로직은 그대로 유지
      const processedUsers = data.users.map((user: any) => ({
        ...user,
        name: user.name || '이름 없음',
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-',
        lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '-',
      }));
      
      console.log('처리된 사용자 데이터:', processedUsers);
      setUsers(processedUsers);
    } catch (error) {
      console.error('사용자 데이터 가져오기 오류:', error);
      setUsers([]);
      setError(`사용자 데이터를 가져오는 중 오류가 발생했습니다. (${error instanceof Error ? error.message : '알 수 없는 오류'})`);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 사용자 목록 로드
  useEffect(() => {
    // 페이지 로드 시 강제로 토큰 갱신 후 사용자 목록 로드
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 먼저 토큰 갱신을 시도
        console.log('페이지 로드 시 토큰 갱신 시도');
        const newToken = await refreshToken();
        
        if (newToken) {
          console.log('토큰 갱신 성공, 사용자 목록 로드 시도');
          // 약간의 지연을 두고 데이터 로드 (토큰이 서버에 반영될 시간 확보)
          setTimeout(() => {
            fetchUsers(false); // 갱신 후 재시도하지 않음
          }, 500);
        } else {
          console.log('토큰 갱신 실패, 기존 토큰으로 시도');
          fetchUsers();
        }
      } catch (error) {
        console.error('초기 데이터 로드 오류:', error);
        setError('초기 데이터 로드 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'fullName') {
      setNewUser((prev) => ({
        ...prev,
        name: {
          ...prev.name,
          first: value,
          last: '' // 성은 빈 문자열로 설정
        }
      }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 비밀번호 가시성 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 사용자 생성 처리
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.email || !newUser.name.first || !newUser.password) {
      toast.error('모든 필드를 채워주세요.');
      return;
    }
    
    try {
      setLoading(true);
      
      // 성(last)은 빈 문자열로 유지하면서 요청
      const userData = {
        ...newUser,
        name: {
          first: newUser.name.first,
          last: newUser.name.last
        }
      };
      
      const response = await apiClient.post('/users', userData);
      
      if (response.success) {
        toast.success('사용자가 성공적으로 생성되었습니다.');
        setShowModal(false);
        fetchUsers(); // 사용자 목록 새로고침
        // 사용자 생성 후 폼 초기화
        setNewUser({
          username: '',
          email: '',
          name: {
            first: '',
            last: ''
          },
          password: '',
          role: 'viewer' as UserRole,
        });
      } else {
        toast.error(response.message || '사용자 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      toast.error('사용자 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 수정을 위한 사용자 설정
  const startEditing = (user: ExtendedUserInfo) => {
    // 이름이 문자열인 경우 객체로 변환
    const nameObject = isNameObject(user.name) 
      ? user.name
      : createNameObject(user.name as string);
      
    setEditingUser({
      ...user,
      name: nameObject
    });
  };

  // 수정 취소
  const cancelEditing = () => {
    setEditingUser(null);
  };

  // handleUpdateUser 함수 수정
  const handleUpdateUser = async (user: ExtendedUserInfo) => {
    try {
      setLoading(true);
      setSuccess('');
      setError('');
      
      console.log('사용자 업데이트 시작:', user.id, '업데이트 데이터:', JSON.stringify(user));
      
      // 헤더 가져오기
      let headers = await getAuthHeader();
      headers['Content-Type'] = 'application/json';
      
      // 첫번째 시도
      let response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(user),
        cache: 'no-store' // 캐시 방지
      });
      
      // 토큰 만료로 401 오류 발생 시 토큰 갱신 후 재시도
      if (response.status === 401) {
        console.log('토큰 만료, 갱신 후 재시도');
        const newToken = await refreshToken();
        
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          
          // 두번째 시도
          response = await fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(user),
            cache: 'no-store' // 캐시 방지
          });
        } else {
          throw new Error('토큰 갱신 실패');
        }
      }
      
      // 응답 텍스트로 먼저 받아서 로깅
      const responseText = await response.text();
      console.log('서버 응답 텍스트:', responseText);
      
      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
      }
      
      // 텍스트를 JSON으로 파싱
      const data = responseText ? JSON.parse(responseText) : {};
      console.log('파싱된 응답 데이터:', data);
      
      if (data.success) {
        setSuccess('사용자 정보가 성공적으로 업데이트되었습니다.');
        setEditingUser(null);
        
        // 짧은 지연 후 사용자 목록 새로고침 (DB 반영 시간 고려)
        setTimeout(() => {
          console.log('사용자 목록 강제 새로고침');
          fetchUsers(false);
        }, 500);
      } else {
        setError(data.message || '사용자 정보 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 업데이트 오류:', error);
      setError(error instanceof Error ? error.message : '사용자 정보 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 삭제 확인
  const confirmDelete = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  // handleDeleteUser 함수 수정
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      setSuccess('');
      setError('');
      
      // 헤더 가져오기
      let headers = await getAuthHeader();
      
      // 첫번째 시도
      let response = await fetch(`/api/users/${userToDelete}`, {
        method: 'DELETE',
        headers
      });
      
      // 토큰 만료로 401 오류 발생 시 토큰 갱신 후 재시도
      if (response.status === 401) {
        console.log('토큰 만료, 갱신 후 재시도');
        const newToken = await refreshToken();
        
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          
          // 두번째 시도
          response = await fetch(`/api/users/${userToDelete}`, {
            method: 'DELETE',
            headers
          });
        } else {
          throw new Error('토큰 갱신 실패');
        }
      }
      
      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('사용자가 성공적으로 삭제되었습니다.');
        setUserToDelete(null);
        setShowDeleteModal(false);
        fetchUsers(); // 사용자 목록 갱신
      } else {
        setError(data.message || '사용자 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 삭제 오류:', error);
      setError(error instanceof Error ? error.message : '사용자 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 문자열 형식화
  const formatDate = (dateString?: string) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 표시할 이름 처리 함수
  const getDisplayName = (name: NameObject | string): string => {
    if (!isNameObject(name)) {
      return name;
    }
    return name.first + (name.last ? ` ${name.last}` : '');
  };

  // 이름의 첫 글자 가져오기
  const getNameInitial = (name: NameObject | string): string => {
    if (!isNameObject(name)) {
      return name.charAt(0).toUpperCase();
    }
    return name.first.charAt(0).toUpperCase();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">사용자 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          사용자 추가
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 p-3 rounded-md">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    이름/이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    사용자 아이디
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    최근 로그인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser && editingUser.id === user.id ? (
                        <div className="flex flex-col space-y-2">
                          <input
                            type="text"
                            value={getFirstName(editingUser.name)}
                            onChange={(e) => {
                              // 이름을 항상 객체로 처리
                              const nameObj = isNameObject(editingUser.name) 
                                ? { ...editingUser.name, first: e.target.value }
                                : createNameObject(e.target.value);
                              
                              setEditingUser({
                                ...editingUser, 
                                name: nameObj
                              });
                            }}
                            className="border rounded-md py-1 px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="이름"
                          />
                          <input
                            type="text"
                            value={editingUser.username}
                            onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                            className="border rounded-md py-1 px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="사용자 아이디"
                            disabled={user.username === 'admin'} // admin 계정은 아이디 변경 불가
                          />
                          <input
                            type="email"
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                            className="border rounded-md py-1 px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="이메일"
                          />
                        </div>
                      ) : (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl uppercase">
                              {getFirstName(user.name).charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {getFirstName(user.name)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser && editingUser.id === user.id ? (
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                          disabled={user.id === currentUser?.id} // 자기 자신의 역할은 변경 불가
                          className="border rounded-md py-1 px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="admin">관리자</option>
                          <option value="editor">편집자</option>
                          <option value="viewer">조회자</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${UserRoleColors[user.role]}`}>
                          {UserRoleNames[user.role]}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser && editingUser.id === user.id ? (
                        <select
                          value={editingUser.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setEditingUser({...editingUser, isActive: e.target.value === 'active'})}
                          disabled={user.id === currentUser?.id} // 자기 자신의 상태는 변경 불가
                          className="border rounded-md py-1 px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="active">활성화</option>
                          <option value="inactive">비활성화</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {user.isActive ? '활성화' : '비활성화'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUser && editingUser.id === user.id ? (
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleUpdateUser(editingUser)}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => startEditing(user)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                            disabled={user.id !== currentUser?.id && user.role === 'admin' && currentUser?.role !== 'admin'}
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => confirmDelete(user.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              disabled={user.role === 'admin' && currentUser?.role !== 'admin'}
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 사용자 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">새 사용자 추가</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={newUser.name.first}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      사용자ID
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={newUser.username || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      이메일
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newUser.email || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={newUser.password || ''}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      역할
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role || 'viewer'}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="admin">관리자</option>
                      <option value="editor">편집자</option>
                      <option value="viewer">조회자</option>
                    </select>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <p><Shield className="inline-block w-3 h-3 mr-1 text-red-500" /> <strong>관리자:</strong> 모든 기능에 접근 가능</p>
                      <p><Shield className="inline-block w-3 h-3 mr-1 text-blue-500" /> <strong>편집자:</strong> 콘텐츠 추가/수정 가능</p>
                      <p><Shield className="inline-block w-3 h-3 mr-1 text-green-500" /> <strong>조회자:</strong> 대시보드 및 콘텐츠 조회만 가능</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    사용자 추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">사용자 삭제</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

