declare module '@yaireo/tagify/dist/react.tagify' {
  import React from 'react';
  
  interface TagifySettings {
    delimiters?: string;
    pattern?: string;
    tagTextProp?: string;
    maxTags?: number;
    callbacks?: {
      add?: (e: any) => void;
      remove?: (e: any) => void;
      click?: (e: any) => void;
      input?: (e: any) => void;
      edit?: (e: any) => void;
      invalid?: (e: any) => void;
      keydown?: (e: any) => void;
      focus?: (e: any) => void;
      blur?: (e: any) => void;
      dropdown?: (e: any) => void;
    };
    whitelist?: string[];
    blacklist?: string[];
    transformTag?: (tagData: any) => void;
    backspace?: boolean;
    placeholder?: string;
    dropdown?: {
      enabled?: number;
      fuzzySearch?: boolean;
      position?: string;
      caseSensitive?: boolean;
      maxItems?: number;
    };
    autoComplete?: boolean;
    duplicates?: boolean;
    enforceWhitelist?: boolean;
    mode?: string;
    readonly?: boolean;
    editTags?: boolean | number;
    keepInvalidTags?: boolean;
    skipInvalid?: boolean;
    mixTagsInterpolator?: any[];
    mixTagsAllowedAfter?: RegExp;
    textareaAutosize?: boolean;
  }
  
  interface TagifyProps extends React.InputHTMLAttributes<HTMLInputElement> {
    settings?: TagifySettings;
    value?: string | string[];
    onChange?: (e: { detail: { value: string; tagify: any } }) => void;
    onInput?: (e: { detail: { value: string; tagify: any } }) => void;
    onAdd?: (e: { detail: { value: string; tagify: any } }) => void;
    onRemove?: (e: { detail: { value: string; tagify: any } }) => void;
    onClick?: (e: { detail: { value: string; tagify: any } }) => void;
    onEdit?: (e: { detail: { value: string; tagify: any } }) => void;
    onInvalid?: (e: { detail: { value: string; tagify: any } }) => void;
    onKeydown?: (e: { detail: { value: string; tagify: any } }) => void;
    onFocus?: (e: { detail: { value: string; tagify: any } }) => void;
    onBlur?: (e: { detail: { value: string; tagify: any } }) => void;
    className?: string;
    name?: string;
    readOnly?: boolean;
    autoFocus?: boolean;
  }
  
  interface TagifyComponent extends React.FC<TagifyProps> {
    // Additional static methods or properties can be defined here
  }
  
  const Tags: TagifyComponent;
  
  export default Tags;
}

declare module '@yaireo/tagify/dist/tagify.css' {
  const content: any;
  export default content;
} 