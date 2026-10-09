'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ChevronDown, Check, UserCircle, Sparkles } from 'lucide-react';

interface RoleOption {
  email: string;
  name: string;
  roleTitle: string;
  badgeColor: string;
  description: string;
}

const ROLES: RoleOption[] = [
  {
    email: 'owner@eventops.local',
    name: 'Bambang Riyandi',
    roleTitle: 'EO Owner',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200',
    description: 'Akses penuh seluruh organisasi, data keuangan & pencairan benefit.',
  },
  {
    email: 'eventmanager@eventops.local',
    name: 'Siti Rahma',
    roleTitle: 'Event Manager',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200',
    description: 'Akses operasional penuh event, approval relawan, manajemen slot.',
  },
  {
    email: 'head.acara@eventops.local',
    name: 'Ahmad Faisal',
    roleTitle: 'Head Divisi Acara',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200',
    description: 'Mengajukan kebutuhan keluar, rundown show, dan kelola tim acara.',
  },
  {
    email: 'head.logistik@eventops.local',
    name: 'Dewi Lestari',
    roleTitle: 'Head Divisi Logistik',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200',
    description: 'Menerima & menyetujui kebutuhan panggung, genset, dan stok perlengkapan.',
  },
  {
    email: 'head.konsumsi@eventops.local',
    name: 'Rian Pratama',
    roleTitle: 'Head Divisi Konsumsi',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200',
    description: 'Mendistribusikan konsumsi Hari H dan verifikasi kuota makanan.',
  },
  {
    email: 'volunteer@eventops.local',
    name: 'Anisa Putri',
    roleTitle: 'Official Volunteer',
    badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border-teal-200',
    description: 'Akses terbatas: jadwal tugas, presensi check-in, dan jatah konsumsi diri.',
  },
];

export function RoleSwitcher({ currentEmail }: { currentEmail?: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeEmail = currentEmail || 'owner@eventops.local';
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
    document.cookie = `eventops_user_email=${email}; path=/; max-age=2592000`;
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted transition-all duration-150 shadow-sm"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
          {activeRole.name.charAt(0)}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-text truncate max-w-[120px] lg:max-w-[160px]">
            {activeRole.name}
          </div>
          <div className="text-[10px] text-text-muted font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {activeRole.roleTitle}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-border shadow-2xl z-50 p-2 animate-fade-in backdrop-blur-xl">
          <div className="p-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Simulasi Peran & Akses (RBAC)
              </span>
              <span className="text-[10px] font-semibold text-text-muted bg-surface-muted px-2 py-0.5 rounded-full border border-border">
                Multi-Tenant
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
              Beralih profil pengguna untuk memverifikasi hak akses, visibilitas modul, dan tombol aksi per peran.
            </p>
          </div>

          <div className="py-1 max-h-80 overflow-y-auto space-y-1">
            {ROLES.map((role) => {
              const isSelected = role.email === activeEmail;
              return (
                <button
                  key={role.email}
                  onClick={() => selectRole(role.email)}
                  type="button"
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-accent-subtle border border-indigo-500/20 text-accent'
                      : 'hover:bg-surface-muted border border-transparent text-text'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-surface-muted text-text-muted border border-border'
                    }`}
                  >
                    {role.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate text-text">{role.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${role.badgeColor}`}
                      >
                        {role.roleTitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2 leading-tight">
                      {role.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
