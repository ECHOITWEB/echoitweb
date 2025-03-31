"use client";

import React from 'react';
import Image, { ImageProps } from 'next/image';

// Custom Image component to fix hydration mismatches with crossOrigin
export function CustomImage(props: ImageProps) {
  // Always add crossOrigin="anonymous" for external images (URLs that start with http)
  const isExternalImage = typeof props.src === 'string' &&
    (props.src.startsWith('http') || props.src.startsWith('//'));

  // Use a consistent crossOrigin value to avoid hydration mismatches
  const imageProps = {
    ...props,
    crossOrigin: isExternalImage ? "anonymous" as const : undefined,
  };

  return <Image {...imageProps} />;
}
