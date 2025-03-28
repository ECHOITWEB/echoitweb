"use client";

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface FallbackImageProps extends ImageProps {
  fallbackSrc?: string;
}

export function FallbackImage({
  fallbackSrc = '/images/news_default.png',
  alt,
  ...props
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      {...props}
      src={error ? fallbackSrc : props.src}
      alt={alt || '이미지'}
      onError={() => setError(true)}
    />
  );
} 