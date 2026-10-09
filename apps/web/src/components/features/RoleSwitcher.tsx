'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ROLES = [
  { email: 'owner@eventops.local', label: 'Bambang Riyandi (EO Owner)' },
  { email: 'eventmanager@eventops.local', label: 'Siti Rahma (Event Manager)' },
  { email: 'head.acara@eventops.local', label: 'Ahmad Faisal (Head Acara)' },
  { email: 'head.logistik@eventops.local', label: 'Dewi Lestari (Head Logistik)' },
  { email: 'head.konsumsi@eventops.local', label: 'Rian Pratama (Head Konsumsi)' },
  { email: 'volunteer@eventops.local', label: 'Anisa Putri (Volunteer)' },
];

export function RoleSwitcher({ currentEmail }: { currentEmail?: string }) {
  const router = useRouter();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    document.cookie = `eventops_user_email=${selected}; path=/; max-age=2592000`;
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg text-xs">
      <UserCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
      <span className="font-semibold text-amber-900 dark:text-amber-200 hidden sm:inline">
        Uji RBAC:
      </span>
      <select
        value={currentEmail || 'owner@eventops.local'}
        onChange={handleRoleChange}
        className="bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 rounded px-2 py-1 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {ROLES.map((r) => (
          <option key={r.email} value={r.email}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
