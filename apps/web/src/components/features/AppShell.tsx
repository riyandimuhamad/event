'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Actor } from '@eventops/shared';

interface AppShellProps {
  orgSlug: string;
  orgName: string;
  eventId: string;
  eventName: string;
  actor: Actor;
  currentEmail?: string;
  children: React.ReactNode;
}

export function AppShell({
  orgSlug,
  orgName,
  eventId,
  eventName,
  actor,
  currentEmail,
  children,
}: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar with mobile drawer support */}
      <Sidebar
        orgSlug={orgSlug}
        eventId={eventId}
        actor={actor}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          orgName={orgName}
          eventName={eventName}
          currentEmail={currentEmail}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
