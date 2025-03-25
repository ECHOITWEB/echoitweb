"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { UserInfo, UserRole } from '@/context/auth-context';
import apiClient from '@/lib/auth/api-client';
import { Eye, EyeOff, Trash, UserPlus, CheckCircle, XCircle, Pencil, Save, Shield } from 'lucide-react';
import Image from 'next/image';

interface ExtendedUserInfo extends UserInfo {
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
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

  // New user form
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'editor' as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/users');

      if (response.success && response.users) {
        setUsers(response.users);
      } else {
        setError('사용자 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle user creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.name) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await apiClient.post('/users', newUser);

      if (response.success) {
        setSuccess('사용자가 성공적으로 생성되었습니다.');
        setNewUser({
          username: '',
          email: '',
          password: '',
          name: '',
          role: 'editor' as UserRole
        });
        setShowModal(false);
        await fetchUsers(); // Refresh user list
      } else {
        setError(response.message || '사용자 생성에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || '사용자 생성 중 오류가 발생했습니다.');
    }
  };

  // Set up user for editing
  const startEditing = (user: ExtendedUserInfo) => {
    setEditingUser(user);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingUser(null);
  };

  // Handle user update
  const handleUpdateUser = async (user: ExtendedUserInfo) => {
    if (!editingUser) return;

    setError('');
    setSuccess('');

    try {
      const response = await apiClient.put(`/users/${editingUser.id}`, {
        role: editingUser.role,
        isActive: editingUser.isActive,
        name: editingUser.name,
        email: editingUser.email
      });

      if (response.success) {
        setSuccess('사용자 정보가 업데이트되었습니다.');
        setEditingUser(null);
        await fetchUsers(); // Refresh user list
      } else {
        setError(response.message || '사용자 업데이트에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || '사용자 업데이트 중 오류가 발생했습니다.');
    }
  };

  // Confirm user deletion
  const confirmDelete = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setError('');
    setSuccess('');

    try {
      const response = await apiClient.delete(`/users/${userToDelete}`);

      if (response.success) {
        setSuccess('사용자가 삭제되었습니다.');
        setShowDeleteModal(false);
        setUserToDelete(null);
        await fetchUsers(); // Refresh user list
      } else {
        setError(response.message || '사용자 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || '사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  // Format date string
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
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    사용자
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    역할
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    상태
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    생성일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    최근 로그인
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
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
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                            className="border rounded-md py-1 px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="이름"
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
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name} ({user.username})
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      )}
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

      {/* New User Modal */}
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      사용자 이름
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={newUser.username}
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
                      value={newUser.email}
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
                        value={newUser.password}
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
                      value={newUser.role}
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

      {/* Delete Confirmation Modal */}
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
