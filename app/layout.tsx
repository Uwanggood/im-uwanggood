import type { Metadata } from 'next';

import '@fontsource-variable/noto-sans-kr';
import './globals.css';

export const metadata: Metadata = {
  title: '송재상 — Projects',
  description: '백엔드·플랫폼·AI 엔지니어 송재상의 프로젝트 아카이브입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
