'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';

interface HeaderProps {
  orgName: string;
  eventName: string;
  currentEmail?: string;
}

export function Header({ orgName, eventName, currentEmail }: HeaderProps) {
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
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Title & Context */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {orgName}
            </span>
            <span className="text-zinc-400">/</span>
            <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
              {eventName}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Offline indicator per design.md Section 5.5 */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Role Switcher for live interactive test */}
        <RoleSwitcher currentEmail={currentEmail} />

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
