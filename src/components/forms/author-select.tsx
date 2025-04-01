import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserInfo } from '@/context/auth-context';
import apiClient from '@/lib/auth/api-client';
import { useAuth } from '@/context/auth-context';

// API 응답에서 오는 확장된 사용자 정보 인터페이스
interface ExtendedUserInfo extends Omit<UserInfo, 'name'> {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  name: string | { first: string; last: string };
}

// 표시할 이름 처리 함수
const getDisplayName = (name: string | { first: string; last: string }): string => {
  if (!name) return '미지정';
  
  if (typeof name === 'string') {
    return name;
  }
  
  // 객체인 경우 first와 last를 조합
  const firstName = name.first || '';
  const lastName = name.last || '';
  
  if (!firstName && !lastName) return '미지정';
  return firstName + (lastName ? ` ${lastName}` : '');
};

// 사용자 목록을 캐싱하기 위한 전역 변수
let cachedUsers: ExtendedUserInfo[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

interface AuthorSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function AuthorSelect({ value, onChange, required = false }: AuthorSelectProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ExtendedUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 현재 사용자를 기본값으로 설정하는 함수
  const setCurrentUserAsDefault = useCallback((userList: ExtendedUserInfo[]) => {
    if ((value === '' || value === 'current_user') && currentUser && currentUser.id) {
      const loggedInUser = userList.find((u) => u.id === currentUser.id);
      if (loggedInUser) {
        onChange(loggedInUser.id);
      }
    }
  }, [currentUser, onChange, value]);

  useEffect(() => {
    // 등록된 사용자 목록 불러오기
    const fetchUsers = async () => {
      // 이미 로딩 중이면 중복 요청 방지
      if (!loading) return;
      
      // 캐시된 데이터가 있고 캐시 시간이 유효하면 사용
      const now = Date.now();
      if (cachedUsers && now - lastFetchTime < CACHE_DURATION) {
        setUsers(cachedUsers.filter(user => user.isActive));
        setCurrentUserAsDefault(cachedUsers);
        setLoading(false);
        return;
      }
      
      try {
        const response = await apiClient.get('/users') as any;
        
        if (response.success) {
          // API 응답 구조 처리 (users 필드 또는 data 필드 확인)
          let userData: ExtendedUserInfo[] = [];
          
          if (response.users && Array.isArray(response.users)) {
            userData = response.users;
          } else if (response.data?.users && Array.isArray(response.data.users)) {
            userData = response.data.users;
          } else if (Array.isArray(response.data)) {
            userData = response.data;
          } else {
            console.error('예상치 못한 API 응답 형식:', response);
            throw new Error('API 응답 형식이 예상과 다릅니다');
          }
          
          const activeUsers = userData.filter((user: ExtendedUserInfo) => user.isActive);
          setUsers(activeUsers);
          
          // 캐시 업데이트
          cachedUsers = userData;
          lastFetchTime = now;
          
          // 현재 사용자가 선택되어 있지 않고, 로그인한 사용자가 있다면 초기값으로 설정
          setCurrentUserAsDefault(userData);
        } else {
          toast({
            variant: 'destructive',
            title: '오류 발생',
            description: '사용자 목록을 불러오는데 실패했습니다.'
          });
        }
      } catch (error) {
        console.error('사용자 목록 불러오기 실패:', error);
        toast({
          variant: 'destructive',
          title: '오류 발생',
          description: '사용자 목록을 불러오는 중 오류가 발생했습니다.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // 의존성 배열에서 value와 onChange 제거하여 불필요한 API 호출 방지
    // currentUser가 변경되었을 때만 사용자 목록을 다시 불러옴
  }, [toast, currentUser, setCurrentUserAsDefault, loading]);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={required ? "작성자 선택 (필수)" : "작성자 선택 (선택사항)"} />
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem key="none" value="current_user">
              선택 안함 (현재 로그인 계정 사용)
            </SelectItem>
          )}
          {loading ? (
            <SelectItem value="loading" disabled>로딩 중...</SelectItem>
          ) : (
            users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {getDisplayName(user.name)} ({user.role === 'admin' ? '관리자' : user.role === 'editor' ? '편집자' : '조회자'})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
} 