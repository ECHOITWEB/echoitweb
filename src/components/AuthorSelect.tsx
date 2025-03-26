import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthorDepartment } from '@/types/news';

export interface Author {
  _id: string;
  name: string;
  department: AuthorDepartment;
}

interface AuthorSelectProps {
  authors: Author[];
  selectedAuthor?: {
    name: string;
    department: AuthorDepartment;
  };
  onSelect: (author: Author) => void;
}

export function AuthorSelect({ authors, selectedAuthor, onSelect }: AuthorSelectProps) {
  const [selectedValue, setSelectedValue] = useState<string>('');

  useEffect(() => {
    if (selectedAuthor) {
      const author = authors.find(
        a => a.name === selectedAuthor.name && a.department === selectedAuthor.department
      );
      if (author) {
        setSelectedValue(author._id);
      }
    }
  }, [selectedAuthor, authors]);

  const handleSelect = (value: string) => {
    const author = authors.find(a => a._id === value);
    if (author) {
      setSelectedValue(value);
      onSelect(author);
    }
  };

  return (
    <Select value={selectedValue} onValueChange={handleSelect}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="작성자 선택" />
      </SelectTrigger>
      <SelectContent>
        {authors.map((author) => (
          <SelectItem key={author._id} value={author._id}>
            {author.name} ({author.department})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 