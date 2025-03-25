'use client';

import React, { useState } from 'react';
import ModernEditor from '@/components/ui/modern-editor';

export default function TestEditorPage() {
  const [content, setContent] = useState('<p>테스트 내용을 입력해보세요...</p>');

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">에디터 테스트 페이지</h1>

      <div className="mb-8">
        <ModernEditor
          value={content}
          onChange={setContent}
          label="글 내용"
          placeholder="내용을 입력하세요..."
        />
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Editor HTML 출력:</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
          {content}
        </pre>
      </div>
    </div>
  );
}
