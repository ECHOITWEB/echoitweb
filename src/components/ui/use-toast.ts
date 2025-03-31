import { useState, useCallback } from 'react'
import * as React from 'react'

interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default', action }: Toast) => {
    setToasts((prev) => [...prev, { title, description, variant, action }])

    // 3초 후 자동으로 제거
    setTimeout(() => {
      setToasts((prev) => prev.slice(1))
    }, 3000)
  }, [])

  return { toast, toasts }
}

export { type Toast }
export const toast = ({ title, description, variant = 'default', action }: Toast) => {
  // 임시로 console.log로 대체
  console.log('Toast:', { title, description, variant, action });
}; 