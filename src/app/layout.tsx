import './globals.css';
import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/main-layout';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import { getSiteSettings } from '@/lib/models/site-settings';

// Get the site settings for metadata
const siteSettings = getSiteSettings();

export const metadata: Metadata = {
  title: 'Echo IT - All Technologies for Smart DX',
  description: 'SAP, AI/RPA, Low-Code, CRM & ITO',
  icons: {
    icon: [
      {
        url: siteSettings.faviconUrl || '/favicon.ico',
        type: 'image/x-icon',
      },
    ],
  },
  openGraph: {
    title: 'Echo IT - All Technologies for Smart DX',
    description: 'SAP, AI/RPA, Low-Code, CRM & ITO',
    images: [siteSettings.ogImageUrl],
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
      </body>
    </html>
  );
}
