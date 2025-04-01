import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface TinyEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// tinymce 패키지가 없으므로 any 타입을 사용합니다
export function TinyEditor({ value, onChange }: TinyEditorProps) {
  const editorRef = useRef<any>(null);

  const handleImageUpload = async (blobInfo: {
    blob: () => Blob;
    filename: () => string;
  }) => {
    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw error;
    }
  };

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      onInit={(evt: any, editor: any) => editorRef.current = editor}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 500,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'image media link | removeformat',
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px }',
        images_upload_handler: handleImageUpload,
        automatic_uploads: true,
        file_picker_types: 'image',
        image_title: true,
        image_description: false,
        image_dimensions: true,
        image_class_list: [
          { title: '없음', value: '' },
          { title: '반응형', value: 'img-fluid' },
          { title: '작게', value: 'img-small' },
          { title: '중간', value: 'img-medium' },
          { title: '크게', value: 'img-large' }
        ],
        image_advtab: true,
        language: 'ko_KR',
        language_url: '/tinymce/langs/ko_KR.js',
        paste_data_images: true,
        relative_urls: false,
        convert_urls: false,
        media_live_embeds: true,
        images_upload_url: '/api/upload',
        images_reuse_filename: true
      }}
    />
  );
} 