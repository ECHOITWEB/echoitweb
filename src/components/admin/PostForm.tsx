import React, { useState, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageUpload from './ImageUpload';
import { NewsCategory, AuthorDepartment } from '@/types/news';
import { AuthorSelect } from '@/components/forms/author-select';
import { Label } from '@/components/ui/label';
import { DayPicker } from 'react-day-picker';

interface IFormData {
  title: { ko: string; en: string; };
  excerpt: { ko: string; en: string; };
  content: { ko: string; en: string; };
  category: string;
  author: {
    department: AuthorDepartment;
    name: string;
  };
  date: string;
  imageSrc: string;
  showOnHomepage: boolean;
  scheduledPublishDate?: Date;
}

interface PostFormProps {
  type: 'news' | 'esg';
  categories: { value: string; label: string; }[];
  onSubmit: (data: any) => Promise<void>;
  initialData?: IFormData;
}

export default function PostForm({ type, categories, onSubmit, initialData }: PostFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IFormData>(initialData || {
    title: { ko: '', en: '' },
    excerpt: { ko: '', en: '' },
    content: { ko: '', en: '' },
    category: '',
    author: {
      department: AuthorDepartment.ADMIN,
      name: ''
    },
    date: new Date().toISOString().split('T')[0],
    imageSrc: '',
    showOnHomepage: true
  });
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [isMainFeatured, setIsMainFeatured] = useState(true);
  const [scheduledPublishDate, setScheduledPublishDate] = useState<Date | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !formData.content || !category) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: { ko: title },
        summary: { ko: summary },
        content: { ko: formData.content },
        category,
        originalUrl: originalUrl || undefined,
        isMainFeatured,
        scheduledPublishDate: isScheduled ? scheduledPublishDate : undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        isPublished: !isScheduled,
        author: formData.author,
        date: formData.date,
        showOnHomepage: formData.showOnHomepage
      });
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('게시물 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = useCallback((url: string) => {
    setThumbnailUrl(url);
  }, []);

  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, ko: value }
    }));
  };

  const handleAuthorChange = (author: { department: AuthorDepartment; name: string }) => {
    setFormData(prev => ({ ...prev, author }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        scheduledPublishDate: date
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          요약 <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={200}
          required
        />
        <p className="text-sm text-gray-500 mt-1">{summary.length}/200</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-md p-2"
          required
        >
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>내용</Label>
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
          value={formData.content.ko}
          onEditorChange={handleContentChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">원본 링크</label>
        <Input
          type="url"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="https://"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">대표 이미지</label>
        <ImageUpload onUpload={handleImageUpload} currentImage={thumbnailUrl} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={isMainFeatured}
          onCheckedChange={setIsMainFeatured}
        />
        <label>메인 노출</label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={isScheduled}
          onCheckedChange={setIsScheduled}
        />
        <label>예약 발행</label>
      </div>

      {isScheduled && (
        <div className="space-y-2">
          <Label>예약 발행 날짜</Label>
          <DayPicker
            mode="single"
            selected={formData.scheduledPublishDate}
            onSelect={handleDateSelect}
            disabled={{ before: new Date() }}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>작성자</Label>
        <AuthorSelect
          value={formData.author}
          onChange={handleAuthorChange}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? '저장 중...' : '저장'}
      </Button>
    </form>
  );
} 