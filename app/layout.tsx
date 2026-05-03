import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const roboto = Roboto({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Mira — Product Intelligence',
  description: 'The living intelligence layer for your product team.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className={`${roboto.variable} min-h-screen bg-background antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
