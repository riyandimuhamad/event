import React from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EventOps — Platform Manajemen Event Organizer Terpadu',
  description: 'Kelola seluruh siklus event: Pre-event, Hari H, hingga Post-event dengan integrasi RBAC dan jejak audit.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
