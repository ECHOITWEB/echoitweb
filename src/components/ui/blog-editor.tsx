"use client";

import React, { useState, useEffect } from 'react';
import ModernEditor from './modern-editor';
import { translateText } from '@/lib/utils/translation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Languages, ChevronDown } from 'lucide-react';

interface TranslationEditorProps {
  koValue: string;
  enValue: string;
  onKoChange: (content: string) => void;
  onEnChange: (content: string) => void;
  label?: string;
  placeholder?: string;
  isInvalid?: boolean;
  errorMessage?: string;
}

const BlogEditor: React.FC<TranslationEditorProps> = ({
  koValue,
  enValue,
  onKoChange,
  onEnChange,
  label,
  placeholder = '내용을 입력하세요...',
  isInvalid,
  errorMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'ko' | 'en'>('ko');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateMode, setTranslateMode] = useState<'manual' | 'auto'>('manual');
  const [translateTimeout, setTranslateTimeout] = useState<NodeJS.Timeout | null>(null);

  // 번역 함수
  const handleTranslate = async () => {
    if (!koValue.trim() || isTranslating) return;
    
    try {
      setIsTranslating(true);
      const translatedText = await translateText(koValue);
      onEnChange(translatedText);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // 자동 번역 모드에서 한국어 내용이 변경될 때 자동으로 번역 수행
  useEffect(() => {
    if (translateMode === 'auto' && koValue && activeTab === 'ko') {
      // 타이핑이 멈추고 1초 후에 번역 실행 (디바운싱)
      if (translateTimeout) {
        clearTimeout(translateTimeout);
      }
      
      const timeout = setTimeout(async () => {
        await handleTranslate();
      }, 1000);
      
      setTranslateTimeout(timeout);
    }
    
    return () => {
      if (translateTimeout) {
        clearTimeout(translateTimeout);
      }
    };
  }, [koValue, translateMode, activeTab]);

  // 언어 탭 변경 처리
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'ko' | 'en');
  };

  // 번역 모드 토글 처리
  const toggleTranslateMode = () => {
    setTranslateMode(prev => prev === 'manual' ? 'auto' : 'manual');
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              자동 번역:
            </span>
            <Button
              type="button"
              variant={translateMode === 'auto' ? 'default' : 'outline'}
              size="sm"
              onClick={toggleTranslateMode}
              className="h-7 px-2 text-xs"
            >
              {translateMode === 'auto' ? '켜짐' : '꺼짐'}
            </Button>
          </div>
        </div>
      )}

      <Tabs
        defaultValue="ko"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-2">
          <TabsList className="mb-0">
            <TabsTrigger value="ko" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              한국어
            </TabsTrigger>
            <TabsTrigger value="en" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              영어
            </TabsTrigger>
          </TabsList>

          {activeTab === 'ko' && translateMode === 'manual' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTranslate}
              disabled={isTranslating || !koValue.trim()}
              className="text-xs"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  번역 중...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-3 w-3" />
                  영어로 번역
                </>
              )}
            </Button>
          )}

          {activeTab === 'ko' && translateMode === 'auto' && isTranslating && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              자동 번역 중...
            </div>
          )}
        </div>

        <TabsContent value="ko" className="mt-0">
          <ModernEditor
            value={koValue}
            onChange={onKoChange}
            placeholder={placeholder}
            isInvalid={isInvalid && activeTab === 'ko'}
            errorMessage={activeTab === 'ko' ? errorMessage : undefined}
          />
        </TabsContent>
        
        <TabsContent value="en" className="mt-0">
          <ModernEditor
            value={enValue}
            onChange={onEnChange}
            placeholder="Enter content in English..."
            isInvalid={isInvalid && activeTab === 'en'}
            errorMessage={activeTab === 'en' ? errorMessage : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogEditor; 