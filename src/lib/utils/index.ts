import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind CSS classes with clsx and tailwind-merge
 * This helps avoid conflicts when combining multiple className strings
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 