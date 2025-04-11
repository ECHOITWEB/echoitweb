import './globals.css';
import type { Metadata, Viewport } from 'next';
import { MainLayout } from '@/components/layout/main-layout';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import { getSiteSettings } from '@/lib/models/site-settings';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';

// Get the site settings for metadata
const siteSettings = getSiteSettings();

// viewport를 별도로 export 하여 경고 문제 해결
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'ECHOIT - All Technologies for Smart DX',
    template: '%s | ECHOIT'
  },
  description: 'SAP, AI/RPA, Low-Code, CRM & ITO',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      {
        url: '/images/favicon.ico',
        type: 'image/x-icon',
      },
    ],
  },
  openGraph: {
    title: 'ECHOIT - All Technologies for Smart DX',
    description: 'SAP, AI/RPA, Low-Code, CRM & ITO',
    images: ['/images/og_default.png'],
    url: 'https://echoit.co.kr',
    siteName: 'ECHOIT',
    locale: 'ko_KR',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('admin_theme');
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                console.warn('Unable to apply theme:', e);
              }

              // 서드파티 라이브러리 경고 무시 설정
              const originalConsoleWarn = console.warn;
              console.warn = function(...args) {
                // TronWeb 관련 경고 무시
                if (typeof args[0] === 'string' && 
                    (args[0].includes('TronWeb') || 
                     args[0].includes('tabReply') || 
                     args[0].includes('mutation event'))) {
                  return;
                }
                return originalConsoleWarn.apply(console, args);
              };

              // 성능 최적화
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                  // 큰 레이아웃 시프트 모니터링 (Core Web Vitals)
                  if (entry.hadRecentInput) return;
                });
              });
              
              if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
                observer.observe({entryTypes: ['layout-shift']});
              }
            `
          }}
        />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//picsum.photos" />
        <link rel="preconnect" href="//fonts.googleapis.com" crossOrigin="anonymous" />
      </head>
      <body className="transition-colors duration-200" suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <Providers>
              <MainLayout>{children}</MainLayout>
            </Providers>
          </LanguageProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
