'use client';

import React from 'react';

// 여러 Provider를 한 번에 감싸는 컴포넌트
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

export default Providers; 