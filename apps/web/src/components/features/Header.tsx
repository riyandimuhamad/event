'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Menu, X, Home, Search } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';

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
    <header className="w-full rounded-2xl glass-panel border border-border shadow-sm px-4 sm:px-5 py-3 flex items-center justify-between gap-4 transition-all">
      {/* Left: Breadcrumbs & Page Heading (Soft UI Style) */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuToggle}
          type="button"
          aria-label="Buka menu navigasi"
          className="lg:hidden p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-surface-muted border border-border"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Organization / Event Breadcrumb & Page Title */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium truncate">
            <Home className="w-3.5 h-3.5 text-text-subtle flex-shrink-0" />
            <span className="text-text-subtle">/</span>
            <span className="truncate max-w-[120px] sm:max-w-[180px]">{orgName}</span>
            <span className="text-text-subtle">/</span>
            <span className="text-text font-semibold truncate max-w-[140px] sm:max-w-xs">{eventName}</span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-text tracking-tight truncate mt-0.5">
            Pusat Komando Operasional
          </div>
        </div>
      </div>

      {/* Right: Search, Network Status, Account Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Soft UI Search Input */}
        <div className="relative hidden md:block w-48 lg:w-56">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari data operasional..."
            className="w-full text-xs rounded-xl border border-border pl-8 pr-3 py-1.5 bg-surface focus:outline-none focus:ring-2 focus:ring-accent text-text placeholder:text-text-subtle shadow-xs"
          />
        </div>

        {/* Online Status */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border ${
            isOnline
              ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
              : 'text-rose-800 bg-rose-50 border-rose-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-700" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-rose-700" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Role Switcher */}
        <RoleSwitcher currentEmail={currentEmail} />
      </div>
    </header>
  );
}
