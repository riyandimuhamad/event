'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
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
  const [isOnline, setIsOnline] = useState(true);

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

  // Online/offline detection
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  // Online indicator left offset — sits just to the right of the sidebar so it never overlaps
  // Sidebar: ml-4 (16px) + collapsed w-20 (80px) + gap 8px = 104px; expanded w-[270px] + 16+8 = 294px
  const onlineLeft = isSidebarCollapsed ? 'left-[112px]' : 'left-[300px]';

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
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-[104px]' : 'lg:pl-[304px]'
        }`}
      >
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

      {/* Online Status Indicator — Fixed bottom, offset from sidebar so it never overlaps */}
      <div
        className={`hidden lg:flex fixed bottom-5 z-40 items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border shadow-lg backdrop-blur-md transition-all duration-300 ${onlineLeft} ${
          isOnline
            ? 'text-emerald-300 bg-[#0D1F13]/80 border-emerald-600/40'
            : 'text-rose-300 bg-[#1F0D0D]/80 border-rose-600/40'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
          }`}
        />
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </div>
    </div>
  );
}
