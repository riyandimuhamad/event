'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Menu, X, Calendar, Layers } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface HeaderProps {
  orgName: string;
  eventName: string;
  currentEmail?: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({
  orgName,
  eventName,
  currentEmail,
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
    <header className="h-16 glass-panel border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile hamburger & Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          type="button"
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-muted border border-border"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 truncate">
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-semibold text-xs text-text-muted truncate max-w-[140px]">
              {orgName}
            </span>
            <span className="text-border">/</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-muted border border-border">
            <Calendar className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="font-bold text-xs text-text truncate max-w-[160px] sm:max-w-xs">
              {eventName}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Offline indicator */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          ></span>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Online Sync</span>
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
