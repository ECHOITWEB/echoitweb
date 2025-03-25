"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  ChevronDown,
  Code,
  MoreHorizontal,
  Upload,
  X
} from 'lucide-react';

interface ModernEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
  isInvalid?: boolean;
  errorMessage?: string;
}

const ModernEditor: React.FC<ModernEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  label,
  isInvalid,
  errorMessage,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize as client-side only to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Show a placeholder during client-side rendering
  if (!isClient) {
    return (
      <div className="w-full border border-gray-300 rounded-md p-4 min-h-[300px] bg-gray-50">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5 mb-2"></div>
        </div>
      </div>
    );
  }

  const addImage = () => {
    setImageUrl('');
    setShowImageModal(true);
  };

  const openLinkModal = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setShowLinkModal(true);
  };

  const saveLink = () => {
    if (!editor) return;

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkModal(false);
  };

  const saveImage = () => {
    if (!editor || (!imageUrl && !isUploadingImage)) return;

    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setShowImageModal(false);
      setImageUrl('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setUploadError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('파일 크기가 5MB를 초과합니다.');
      return;
    }

    setUploadError('');
    setIsUploadingImage(true);

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setImageUrl(data.url);
        } else {
          setUploadError(data.message || '이미지 업로드에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('Error uploading image:', error);
        setUploadError('이미지 업로드 중 오류가 발생했습니다.');
      })
      .finally(() => {
        setIsUploadingImage(false);
      });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full font-sans">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div className={`border rounded-lg overflow-hidden ${isInvalid ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}>
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center mr-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              type="button"
            >
              카테고리 <ChevronDown className="h-4 w-4 ml-1" />
            </button>

            {isCategoryOpen && (
              <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsCategoryOpen(false)}
                    type="button"
                  >
                    기술 블로그
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsCategoryOpen(false)}
                    type="button"
                  >
                    뉴스
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsCategoryOpen(false)}
                    type="button"
                  >
                    ESG
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* Text Formatting */}
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <Bold className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <Italic className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <UnderlineIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <Strikethrough className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* Text Alignment */}
          <button
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <AlignLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <AlignCenter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <AlignRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* Lists */}
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <List className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <ListOrdered className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* Links & Media */}
          <button
            onClick={openLinkModal}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <LinkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={addImage}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            type="button"
          >
            <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* Headings */}
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <Heading1 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <Heading2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor?.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            type="button"
          >
            <Code className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex-grow"></div>

          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            type="button"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Editor Content */}
        <div className="bg-white dark:bg-gray-800 min-h-[300px]">
          <EditorContent editor={editor} className="prose dark:prose-invert max-w-none p-4 outline-none min-h-[300px]" />
        </div>
      </div>

      {/* Display error message if the editor is invalid */}
      {isInvalid && errorMessage && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">링크 삽입</h3>

              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setShowLinkModal(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  onClick={saveLink}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">이미지 삽입</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    이미지 URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">또는</span>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        내 컴퓨터에서 이미지 선택
                      </>
                    )}
                  </button>
                </div>

                {uploadError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                )}
              </div>

              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setShowImageModal(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  onClick={saveImage}
                  disabled={!imageUrl || isUploadingImage}
                >
                  삽입
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernEditor;
