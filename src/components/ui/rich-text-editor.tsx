"use client";

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  label?: string;
  isInvalid?: boolean;
  errorMessage?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  height = 500,
  placeholder = '내용을 입력하세요...',
  label,
  isInvalid,
  errorMessage
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className={`border ${isInvalid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md`}>
        <Editor
          apiKey="no-api-key" // TinyMCE API 키 (개발용으로는 no-api-key 사용)
          onInit={(evt, editor) => (editorRef.current = editor)}
          value={value}
          onEditorChange={handleEditorChange}
          init={{
            height,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
              'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 14px }',
            placeholder,
            skin: 'oxide',
            skin_url: '/tinymce/skins/ui/oxide',
            content_css: '/tinymce/skins/content/default/content.css',
            language: 'ko_KR',
            language_url: '/tinymce/langs/ko_KR.js',
            branding: false,
            promotion: false
          }}
        />
      </div>
      {isInvalid && errorMessage && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
};

export default RichTextEditor;
