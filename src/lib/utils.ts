import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string based on locale
 * @param dateString - ISO date string
 * @param locale - Locale for formatting (e.g. 'ko-KR', 'en-US')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  const date = new Date(dateString);

  // Use Intl.DateTimeFormat for localized date formatting
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date string as a relative time (e.g. "3 days ago")
 * @param dateString - ISO date string
 * @param locale - Locale for formatting
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string, locale: string = 'en-US'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // For dates less than a week old, show relative time
  if (diffInDays < 7) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return rtf.format(-diffInMinutes, 'minute');
      }
      return rtf.format(-diffInHours, 'hour');
    }

    return rtf.format(-diffInDays, 'day');
  }

  // For older dates, show formatted date
  return formatDate(dateString, locale);
}
