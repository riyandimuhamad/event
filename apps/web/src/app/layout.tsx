import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'EventOps — Platform Manajemen Operasional Event Organizer Terpadu',
  description: 'Sistem komando terpadu untuk Event Organizer: Pre-event, Hari H, dan Pasca-event dengan isolasi tenant dan audit trail lengkap.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} font-sans`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){ try { document.documentElement.classList.remove('dark'); localStorage.removeItem('eventops_theme'); } catch(e){} })();`,
          }}
        />
      </head>
      <body className="antialiased selection:bg-[#7A2E33] selection:text-white bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
