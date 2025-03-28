import './globals.css';
import type { Metadata, Viewport } from 'next';
import { MainLayout } from '@/components/layout/main-layout';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import { getSiteSettings } from '@/lib/models/site-settings';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';

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
  },
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
            `
          }}
        />
      </head>
      <body className="transition-colors duration-200" suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <MainLayout>{children}</MainLayout>
          </LanguageProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
