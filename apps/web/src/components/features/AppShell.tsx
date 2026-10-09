import React from 'react';
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
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar orgSlug={orgSlug} eventId={eventId} actor={actor} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header orgName={orgName} eventName={eventName} currentEmail={currentEmail} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
