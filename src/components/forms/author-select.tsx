import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserInfo } from '@/context/auth-context';
import apiClient from '@/lib/auth/api-client';

interface AuthorSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function AuthorSelect({ value, onChange }: AuthorSelectProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    // 등록된 사용자 목록 불러오기
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users');
        if (response.success && response.users) {
          setUsers(response.users.filter(user => user.isActive));
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
      }
    };

    fetchUsers();
  }, [toast]);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="작성자 선택" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.name}>
              {user.name} ({user.role === 'admin' ? '관리자' : user.role === 'editor' ? '편집자' : '조회자'})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 