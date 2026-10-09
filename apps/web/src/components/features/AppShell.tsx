'use client';

import React, { useState, useEffect } from 'react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load persisted collapse preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('eventops_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('eventops_sidebar_collapsed', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Global keyboard shortcut: Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-bg text-text">
      {/* Sidebar with desktop collapse and mobile drawer support */}
      <Sidebar
        orgSlug={orgSlug}
        orgName={orgName}
        eventId={eventId}
        actor={actor}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Layout Area - padded to clear floating sidebar on large screens */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10 flex flex-col gap-6">
          <Header
            orgName={orgName}
            eventName={eventName}
            currentEmail={currentEmail}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          <main className="w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
