'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CheckCircle2, XCircle, Clock, QrCode } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface VolunteerData {
  id: string;
  code: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  shirtSize: string | null;
  registrationStatus: string;
  divisionId: string | null;
  division: { id: string; name: string; code: string } | null;
  shifts: Array<{
    id: string;
    status: string;
    checkedInAt: string | null;
    shift: { name: string; startsAt: string; endsAt: string };
  }>;
}

interface VolunteersClientProps {
  initialVolunteers: VolunteerData[];
  divisions: Array<{ id: string; name: string; code: string }>;
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

export function VolunteersClient({
  initialVolunteers,
  divisions,
  actor,
  orgSlug,
  eventId,
}: VolunteersClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  const filtered = initialVolunteers.filter((v) => {
    if (selectedDivision !== 'all' && v.divisionId !== selectedDivision) return false;
    if (selectedStatus !== 'all' && v.registrationStatus !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = v.fullName.toLowerCase().includes(q);
      const matchCode = v.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (volunteerId: string, status: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(
        `/api/v1/volunteers/${volunteerId}/status?orgSlug=${orgSlug}&eventId=${eventId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) {
        const json = await res.json();
        alert(json.error?.message || 'Gagal mengubah status relawan');
      }
      router.refresh();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const isManagerOrOwner = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('volunteers.title')}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">{t('volunteers.subtitle')}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama atau kode VOL-XXXX..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm rounded-lg border border-border pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="text-xs rounded-lg border border-border px-3 py-2 bg-zinc-50 dark:bg-zinc-900 font-medium"
          >
            <option value="all">Semua Divisi</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-lg border border-border px-3 py-2 bg-zinc-50 dark:bg-zinc-900 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="APPROVED">Diterima (APPROVED)</option>
            <option value="PENDING">Menunggu (PENDING)</option>
            <option value="REJECTED">Ditolak (REJECTED)</option>
          </select>
        </div>
      </div>

      {/* Volunteers Table / Cards */}
      <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-border text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Kode & Relawan</th>
                <th className="px-6 py-3.5">Divisi Penempatan</th>
                <th className="px-6 py-3.5">Ukuran Kaos</th>
                <th className="px-6 py-3.5">Shift & Presensi</th>
                <th className="px-6 py-3.5">Status Pendaftaran</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((vol) => {
                const isDivHead =
                  actor.eventRole === 'DIVISION_HEAD' && actor.divisionId === vol.divisionId;
                const canApprove = isManagerOrOwner || isDivHead;
                const checkedIn = vol.shifts.some((s) => s.checkedInAt !== null);

                return (
                  <tr key={vol.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-mono font-bold text-xs border border-indigo-200">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {vol.fullName}
                          </div>
                          <div className="font-mono text-xs text-zinc-400 tabular-nums">
                            {vol.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {vol.division?.name || 'Belum Ditentukan'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {vol.shirtSize || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {vol.shifts.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {vol.shifts[0].shift.name}
                          </div>
                          {checkedIn ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Sudah Check-in
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-400">Belum Check-in</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">Belum ada shift</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={vol.registrationStatus} context="volunteer" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {vol.registrationStatus === 'PENDING' && canApprove ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(vol.id, 'APPROVED')}
                            disabled={isUpdating}
                            title="Terima Relawan"
                            className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(vol.id, 'REJECTED')}
                            disabled={isUpdating}
                            title="Tolak Relawan"
                            className="p-1.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
