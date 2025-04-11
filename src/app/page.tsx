// app 폴더 바로 밑에 있는 page.tsx는 바로 브라우저의 최상위 주소인 '/'가 됩니다.

import Link from 'next/link';
import Image from 'next/image';
import { HeroSection } from '@/components/home/hero-section';
import { CoreValuesSection } from '@/components/home/core-values-section';
import { TechnologiesSection } from '@/components/home/technologies-section';
import { CustomersSection } from '@/components/home/customers-section';
import { ContactSection } from '@/components/home/contact-section';

export const metadata = {
  title: 'ECHOIT - 디지털 혁신을 위한 최고의 파트너',
  description: 'SAP, Mendix, AI/RPA 솔루션으로 디지털 혁신을 이끄는 ECHOIT의 웹사이트입니다.',
  metadataBase: new URL('https://same-2m68l63tuum-latest.netlify.app'),
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CoreValuesSection />
      <TechnologiesSection />
      <CustomersSection />
      <ContactSection />
    </main>
  );
}
