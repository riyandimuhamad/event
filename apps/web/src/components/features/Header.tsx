'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Menu, X, Calendar, PanelLeft } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface HeaderProps {
  orgName: string;
  eventName: string;
  currentEmail?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({
  orgName,
  eventName,
  currentEmail,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onMobileMenuToggle,
  isMobileMenuOpen,
}: HeaderProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Sidebar toggle (Desktop & Mobile) + Breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuToggle}
          type="button"
          aria-label="Buka menu navigasi"
          className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Desktop Sidebar Toggle (Shown when collapsed or can be used as quick toggle) */}
        <button
          onClick={onToggleSidebarCollapse}
          type="button"
          title={isSidebarCollapsed ? 'Buka navigasi (Ctrl+B)' : 'Sembunyikan navigasi (Ctrl+B)'}
          aria-label="Toggle navigasi"
          className={`hidden lg:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border transition-colors ${
            isSidebarCollapsed
              ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <PanelLeft className="w-4 h-4 stroke-[1.75]" />
        </button>

        {/* Organization / Event Breadcrumb */}
        <div className="flex items-center gap-2 truncate text-xs">
          <span className="hidden sm:inline font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[130px]">
            {orgName}
          </span>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">/</span>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/60 font-semibold truncate max-w-[180px] sm:max-w-xs">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
            <span className="truncate">{eventName}</span>
          </div>
        </div>
      </div>

      {/* Right: Network Status, Theme Switcher, Account Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Offline indicator */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${
            isOnline
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60'
              : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-500' : 'bg-rose-500'
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
              <span>Offline Mode</span>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Role Switcher */}
        <RoleSwitcher currentEmail={currentEmail} />
      </div>
    </header>
  );
}
