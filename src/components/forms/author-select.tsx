import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthorDepartment } from '@/types/news';

interface Author {
  name: string;
  department: AuthorDepartment;
}

interface AuthorSelectProps {
  value: {
    department: AuthorDepartment;
    name: string;
  };
  onChange: (value: {
    department: AuthorDepartment;
    name: string;
  }) => void;
}

export function AuthorSelect({ value, onChange }: AuthorSelectProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [customName, setCustomName] = useState(value.name);
  const [savedAuthors, setSavedAuthors] = useState<Author[]>([]);

  useEffect(() => {
    // 저장된 작성자 목록 불러오기
    const fetchAuthors = async () => {
      try {
        const response = await fetch('/api/authors');
        if (response.ok) {
          const authors = await response.json();
          setSavedAuthors(authors);
        }
      } catch (error) {
        console.error('작성자 목록 불러오기 실패:', error);
      }
    };

    fetchAuthors();
  }, []);

  const handleDepartmentChange = (department: AuthorDepartment) => {
    if (department === AuthorDepartment.CUSTOM) {
      setIsEditing(true);
      onChange({ department, name: customName || '' });
    } else {
      setIsEditing(false);
      // 저장된 작성자 중에서 선택
      const savedAuthor = savedAuthors.find(author => author.department === department);
      if (savedAuthor) {
        onChange({ department, name: savedAuthor.name });
      } else {
        onChange({ department, name: department });
      }
    }
  };

  const handleCustomNameSave = async () => {
    if (!customName.trim()) {
      toast({
        variant: 'destructive',
        title: '작성자 이름을 입력해주세요.',
        description: '작성자 이름은 필수 항목입니다.'
      });
      return;
    }

    try {
      const response = await fetch('/api/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customName,
          department: value.department,
        }),
      });

      if (!response.ok) {
        throw new Error('작성자 저장에 실패했습니다.');
      }

      const data = await response.json();
      
      // 새로운 작성자를 목록에 추가
      setSavedAuthors(prev => [...prev, { name: customName, department: value.department }]);
      
      setIsEditing(false);
      onChange({ department: value.department, name: customName });
      
      toast({
        title: '작성자 정보 저장 완료',
        description: data.message || '작성자 정보가 성공적으로 저장되었습니다.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: error instanceof Error ? error.message : '작성자 저장 중 오류가 발생했습니다.'
      });
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={value.department}
        onValueChange={(val: AuthorDepartment) => handleDepartmentChange(val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="부서 선택" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(AuthorDepartment).map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(isEditing || value.department === AuthorDepartment.CUSTOM) && (
        <div className="flex gap-2">
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="작성자 이름 입력"
          />
          <Button onClick={handleCustomNameSave} variant="secondary">
            작성자 저장
          </Button>
        </div>
      )}

      {savedAuthors.length > 0 && !isEditing && (
        <Select
          value={value.name}
          onValueChange={(name) => onChange({ ...value, name })}
        >
          <SelectTrigger>
            <SelectValue placeholder="저장된 작성자 선택" />
          </SelectTrigger>
          <SelectContent>
            {savedAuthors
              .filter(author => author.department === value.department)
              .map((author) => (
                <SelectItem key={author.name} value={author.name}>
                  {author.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
} 