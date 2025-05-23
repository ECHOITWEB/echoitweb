import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

// 사용자 역할 타입
type UserRole = 'admin' | 'editor' | 'viewer';

// API 응답에서 오는 확장된 사용자 정보 인터페이스
interface ExtendedUserInfo {
  id: string;
  username: string;
  email: string;
  name: string | { first: string; last: string };
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 역할에 따른 표시 이름 변환 함수
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin': return '관리자';
    case 'editor': return '편집자';
    case 'viewer': return '조회자';
    default: return role;
  }
};

// 이름 객체 처리 함수
const getDisplayName = (name: string | { first: string; last: string }): string => {
  if (typeof name === 'object' && name !== null) {
    return name.first || '미지정';
  }
  return name || '미지정';
};

// 사용자 표시 이름 생성 함수 (이름(역할) 형식)
const createAuthorDisplayName = (user: ExtendedUserInfo): string => {
  const name = getDisplayName(user.name);
  const roleDisplay = getRoleDisplayName(user.role);
  return `${name}(${roleDisplay})`;
};

// 사용자 정보 생성 함수
const createAuthorInfo = (user: ExtendedUserInfo): string => {
  const name = getDisplayName(user.name);
  const roleDisplay = getRoleDisplayName(user.role);
  
  // JSON 문자열로 변환하여 필요한 정보만 포함
  return JSON.stringify({
    name,
    email: user.email,
    username: user.username,
    role: user.role
  });
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
  const [selectedUserInfo, setSelectedUserInfo] = useState<string>(''); // 표시용 사용자 정보
  
  // 현재 사용자를 기본값으로 설정하는 함수
  const setCurrentUserAsDefault = useCallback((userList: ExtendedUserInfo[]) => {
    if ((value === '' || value === 'current_user') && currentUser && currentUser.id) {
      const loggedInUser = userList.find((u) => u.id === currentUser.id);
      if (loggedInUser) {
        // 현재 사용자 정보를 JSON 문자열로 변환하여 저장
        const userInfo = createAuthorInfo(loggedInUser);
        onChange(userInfo);
        setSelectedUserInfo(createAuthorDisplayName(loggedInUser));
      }
    } else if (value && value !== 'current_user') {
      try {
        // value가 JSON 문자열인 경우 파싱
        const userInfo = JSON.parse(value);
        if (userInfo && userInfo.name && userInfo.role) {
          setSelectedUserInfo(`${userInfo.name}(${getRoleDisplayName(userInfo.role)})`);
        }
      } catch (e) {
        // JSON이 아닌 경우 ID로 취급하여 사용자 검색
        const selectedUser = userList.find((u) => u.id === value);
        if (selectedUser) {
          setSelectedUserInfo(createAuthorDisplayName(selectedUser));
        }
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
        const response = await fetch('/api/users') as any;
        
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

  // 사용자 선택 처리
  const handleValueChange = (newValue: string) => {
    if (newValue === 'current_user') {
      onChange('current_user');
      setSelectedUserInfo('현재 로그인 계정');
    } else {
      const selectedUser = users.find(u => u.id === newValue);
      if (selectedUser) {
        // 사용자 정보를 JSON 문자열로 변환하여 저장
        const userInfo = createAuthorInfo(selectedUser);
        onChange(userInfo);
        setSelectedUserInfo(createAuthorDisplayName(selectedUser));
      }
    }
  };

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={handleValueChange}>
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
          ) : users.length === 0 ? (
            <SelectItem value="no_users" disabled>사용자가 없습니다</SelectItem>
          ) : (
            users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {createAuthorDisplayName(user)}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {selectedUserInfo && (
        <p className="text-xs text-gray-500">선택된 작성자: {selectedUserInfo}</p>
      )}
    </div>
  );
} 