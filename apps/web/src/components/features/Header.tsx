'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Menu, X, Home, Search, PanelLeft } from 'lucide-react';
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
    <header className="sticky top-3 z-20 mx-3 sm:mx-5 lg:mx-6 mb-5 rounded-2xl glass-panel border border-border shadow-sm px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4 transition-all">
      {/* Left: Breadcrumbs & Page Heading (Soft UI Style) */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuToggle}
          type="button"
          aria-label="Buka menu navigasi"
          className="lg:hidden p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-surface-muted border border-border"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={onToggleSidebarCollapse}
          type="button"
          title={isSidebarCollapsed ? 'Buka navigasi (Ctrl+B)' : 'Sembunyikan navigasi (Ctrl+B)'}
          aria-label="Toggle navigasi"
          className={`hidden lg:flex p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-surface-muted border transition-all ${
            isSidebarCollapsed
              ? 'border-accent/40 bg-accent-subtle text-accent'
              : 'border-border'
          }`}
        >
          <PanelLeft className="w-4 h-4 stroke-[1.75]" />
        </button>

        {/* Organization / Event Breadcrumb & Page Title */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium truncate">
            <Home className="w-3 h-3 text-text-subtle flex-shrink-0" />
            <span className="text-text-subtle">/</span>
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{orgName}</span>
            <span className="text-text-subtle">/</span>
            <span className="text-text font-semibold truncate max-w-[140px] sm:max-w-xs">{eventName}</span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-text tracking-tight truncate mt-0.5">
            Pusat Komando Operasional
          </div>
        </div>
      </div>

      {/* Right: Search, Network Status, Theme Switcher, Account Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Soft UI Search Input */}
        <div className="relative hidden md:block w-48 lg:w-56">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari data operasional..."
            className="w-full text-xs rounded-xl border border-border pl-8 pr-3 py-1.5 bg-surface/80 focus:outline-none focus:ring-2 focus:ring-accent text-text placeholder:text-text-subtle shadow-xs"
          />
        </div>

        {/* Offline indicator */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border ${
            isOnline
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
              : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
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
              <span>Offline</span>
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
