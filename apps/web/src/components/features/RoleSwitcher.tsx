'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  User,
  Building,
  LogOut,
  SlidersHorizontal,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface RoleOption {
  email: string;
  name: string;
  roleTitle: string;
  badgeColor: string;
  description: string;
}

const ROLES: RoleOption[] = [
  {
    email: 'budi.owner@nusantaracreative.id',
    name: 'Bambang Riyandi',
    roleTitle: 'EO Owner (All Access)',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
    description: 'Akses penuh seluruh organisasi, event portfolio & data keuangan.',
  },
  {
    email: 'siti.manager@nusantaracreative.id',
    name: 'Siti Rahmawati',
    roleTitle: 'Event Manager',
    badgeColor: 'bg-accent-subtle text-accent dark:text-[#FFC46B] border-accent/20',
    description: 'Akses operasional penuh event, approval relawan, manajemen slot.',
  },
  {
    email: 'dewi.konsumsi@nusantaracreative.id',
    name: 'Dewi Lestari',
    roleTitle: 'Head Divisi Konsumsi',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
    description: 'Mendistribusikan konsumsi Hari H dan verifikasi kuota makanan.',
  },
  {
    email: 'volunteer.0001@eventops.id',
    name: 'Rian Pratama',
    roleTitle: 'Relawan Operasional',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
    description: 'Akses terbatas: jadwal tugas, presensi check-in, dan jatah konsumsi.',
  },
];

export function RoleSwitcher({ currentEmail }: { currentEmail?: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showDemoList, setShowDemoList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeEmail = currentEmail || 'budi.owner@nusantaracreative.id';
  const activeRole = ROLES.find((r) => r.email === activeEmail) || ROLES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectRole = (email: string) => {
    // Set cookie with SameSite attribute to ensure it's sent on subsequent requests
    document.cookie = `eventops_user_email=${email}; path=/; max-age=2592000; SameSite=Lax`;
    // Persist selected role in local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem('eventops_active_role_email', email);
    }
    setIsOpen(false);
    // Force a full page reload so the server reads the updated cookie
    window.location.reload();
  };

  const handleLogout = () => {
    document.cookie = 'eventops_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eventops_active_role_email');
    }
    window.location.href = '/';
  };

  return (
    <div className="relative select-none" ref={containerRef}>
      {/* Trigger Button - Standard User Avatar Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 bg-black/25 hover:bg-white/10 transition-all duration-150 shadow-sm"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7A2E33] to-[#4A171B] text-[#FFC46B] flex items-center justify-center font-bold text-xs shadow-inner border border-[#FFC46B]/40 flex-shrink-0">
          {activeRole.name.charAt(0)}
        </div>
        <div className="text-left hidden sm:block min-w-0">
          <div className="text-xs font-bold text-white truncate max-w-[120px] lg:max-w-[150px]">
            {activeRole.name}
          </div>
          <div className="text-[10px] text-[#E8D7D8] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="truncate">{activeRole.roleTitle}</span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#E8D7D8] ml-0.5" />
      </button>

      {/* Standard SaaS User Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-surface border border-border shadow-2xl z-50 p-2 animate-fade-in text-text">
          {/* User Info Header Card */}
          <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-black text-sm shadow-md flex-shrink-0">
              {activeRole.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-text truncate">{activeRole.name}</div>
              <div className="text-xs text-text-muted truncate">{activeRole.email}</div>
              <div className="mt-1">
                <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${activeRole.badgeColor}`}>
                  {activeRole.roleTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Standard SaaS Profile Actions */}
          <div className="py-2 space-y-1 text-xs border-b border-border">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                alert(`Profil: ${activeRole.name}\nRole: ${activeRole.roleTitle}\nEmail: ${activeRole.email}`);
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-medium text-text hover:bg-surface-muted flex items-center gap-2.5 transition-colors"
            >
              <User className="w-4 h-4 text-text-muted" />
              <span>Profil Saya &amp; Akun</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/nusantara-creative/events');
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-medium text-text hover:bg-surface-muted flex items-center gap-2.5 transition-colors"
            >
              <Building className="w-4 h-4 text-text-muted" />
              <span>Pengaturan Organisasi</span>
            </button>
          </div>

          {/* Collapsible Demo Switcher Sub-menu */}
          <div className="pt-1.5 pb-1">
            <button
              type="button"
              onClick={() => setShowDemoList(!showDemoList)}
              className="w-full px-3 py-1.5 text-left text-[11px] font-semibold text-text-muted hover:text-text flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
                <span>Simulasi Peran Demo</span>
              </span>
              <span>{showDemoList ? '▲' : '▼'}</span>
            </button>

            {showDemoList && (
              <div className="mt-1 space-y-1 p-1 bg-surface-muted rounded-xl border border-border">
                {ROLES.map((role) => {
                  const isSelected = role.email === activeEmail;
                  return (
                    <button
                      key={role.email}
                      onClick={() => selectRole(role.email)}
                      type="button"
                      className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-accent text-white font-bold shadow-xs'
                          : 'hover:bg-surface text-text font-medium'
                      }`}
                    >
                      <div>
                        <div className="text-xs">{role.name}</div>
                        <div className="text-[10px] opacity-75">{role.roleTitle}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Logout Action */}
          <div className="pt-1 border-t border-border">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-3 py-2.5 rounded-xl text-left font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors text-xs"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
