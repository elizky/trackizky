import type { Metadata } from 'next';
import { Ubuntu, Ubuntu_Mono } from 'next/font/google';
import './globals.css';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';

const ubuntuSans = Ubuntu({
  variable: '--font-ubuntu-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

const ubuntuMono = Ubuntu_Mono({
  variable: '--font-ubuntu-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Trackizky',
  description: 'Daily activity tracking app',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Trackizky',
  },
  icons: {
    apple: '/apple-icon-180.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${ubuntuSans.variable} ${ubuntuMono.variable} antialiased bg-background`}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
