'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Users,
  UserCheck,
  UserX,
  Printer,
  Sparkles,
  Shirt,
  Calendar,
  Building,
} from 'lucide-react';
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
  const [volunteers, setVolunteers] = useState<VolunteerData[]>(initialVolunteers);
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPresence, setSelectedPresence] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [selectedVolunteerForIdCard, setSelectedVolunteerForIdCard] = useState<VolunteerData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Statistics calculation
  const totalVolunteers = volunteers.length;
  const approvedCount = volunteers.filter((v) => v.registrationStatus === 'APPROVED').length;
  const pendingCount = volunteers.filter((v) => v.registrationStatus === 'PENDING').length;
  const checkedInCount = volunteers.filter((v) =>
    v.shifts.some((s) => s.checkedInAt !== null)
  ).length;

  const filtered = volunteers.filter((v) => {
    if (selectedDivision !== 'all' && v.divisionId !== selectedDivision) return false;
    if (selectedStatus !== 'all' && v.registrationStatus !== selectedStatus) return false;

    const isCheckedIn = v.shifts.some((s) => s.checkedInAt !== null);
    if (selectedPresence === 'checked_in' && !isCheckedIn) return false;
    if (selectedPresence === 'not_checked_in' && isCheckedIn) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = v.fullName.toLowerCase().includes(q);
      const matchCode = v.code.toLowerCase().includes(q);
      const matchEmail = v.email ? v.email.toLowerCase().includes(q) : false;
      if (!matchName && !matchCode && !matchEmail) return false;
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
        return;
      }

      // Optimistic update
      setVolunteers((prev) =>
        prev.map((v) => (v.id === volunteerId ? { ...v, registrationStatus: status } : v))
      );

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
          <h1 className="text-2xl font-bold tracking-tight text-text">
            {t('volunteers.title')}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {t('volunteers.subtitle')}
          </p>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
          <div className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-text-subtle" /> Total Relawan Terdaftar
          </div>
          <div className="text-2xl font-bold text-text mt-1">
            {totalVolunteers}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-300/40 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" /> Diterima (Approved)
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">
            {approvedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-300/40 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Menunggu Seleksi
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-accent/25 bg-accent-subtle shadow-sm">
          <div className="text-xs font-semibold text-accent dark:text-[#FFC46B] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hadir / Check-in Hari H
          </div>
          <div className="text-2xl font-bold text-accent dark:text-[#FFC46B] mt-1">
            {checkedInCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama relawan atau kode VOL-XXXX..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl border border-border pl-9 pr-3 py-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="text-xs rounded-xl border border-border px-3 py-2 bg-surface font-medium text-text"
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
            className="text-xs rounded-xl border border-border px-3 py-2 bg-surface font-medium text-text"
          >
            <option value="all">Semua Status</option>
            <option value="APPROVED">Diterima (APPROVED)</option>
            <option value="PENDING">Menunggu (PENDING)</option>
            <option value="REJECTED">Ditolak (REJECTED)</option>
          </select>

          <select
            value={selectedPresence}
            onChange={(e) => setSelectedPresence(e.target.value as any)}
            className="text-xs rounded-xl border border-border px-3 py-2 bg-surface font-medium text-text"
          >
            <option value="all">Semua Presensi</option>
            <option value="checked_in">Sudah Check-in</option>
            <option value="not_checked_in">Belum Check-in</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Relawan & Kode ID</th>
                <th className="px-6 py-3.5">Divisi Penempatan</th>
                <th className="px-6 py-3.5">Ukuran Kaos</th>
                <th className="px-6 py-3.5">Shift & Presensi</th>
                <th className="px-6 py-3.5">Status Pendaftaran</th>
                <th className="px-6 py-3.5 text-right">Aksi & ID Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((vol) => {
                const isDivHead =
                  actor.eventRole === 'DIVISION_HEAD' && actor.divisionId === vol.divisionId;
                const canApprove = isManagerOrOwner || isDivHead;
                const checkedIn = vol.shifts.some((s) => s.checkedInAt !== null);

                return (
                  <tr key={vol.id} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedVolunteerForIdCard(vol)}
                          title="Klik untuk lihat ID Card"
                          className="w-9 h-9 rounded-xl bg-accent-subtle text-accent dark:text-[#FFC46B] flex items-center justify-center font-mono font-bold text-xs border border-accent/25 hover:scale-105 transition-transform"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="font-semibold text-text">
                            {vol.fullName}
                          </div>
                          <div className="font-mono text-xs text-text-muted tabular-nums">
                            {vol.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-surface-muted text-xs font-medium text-text">
                        {vol.division?.name || 'Belum Ditentukan'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-text bg-surface-muted px-2 py-0.5 rounded border border-border">
                        {vol.shirtSize || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {vol.shifts.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-text">
                            {vol.shifts[0].shift.name}
                          </div>
                          {checkedIn ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Sudah Check-in
                            </span>
                          ) : (
                            <span className="text-[11px] text-text-muted">Belum Check-in</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">Belum ada shift</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={vol.registrationStatus} context="volunteer" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedVolunteerForIdCard(vol)}
                          className="px-2.5 py-1 text-xs font-semibold text-accent dark:text-[#FFC46B] hover:bg-accent-subtle rounded-lg border border-accent/25 transition-colors"
                        >
                          Lihat ID Pas
                        </button>

                        {vol.registrationStatus === 'PENDING' && canApprove && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(vol.id, 'APPROVED')}
                              disabled={isUpdating}
                              title="Terima Relawan"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(vol.id, 'REJECTED')}
                              disabled={isUpdating}
                              title="Tolak Relawan"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile & Tablet Card Layout */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((vol) => {
          const isDivHead =
            actor.eventRole === 'DIVISION_HEAD' && actor.divisionId === vol.divisionId;
          const canApprove = isManagerOrOwner || isDivHead;
          const checkedIn = vol.shifts.some((s) => s.checkedInAt !== null);

          return (
            <div
              key={vol.id}
              className="bg-surface border border-border rounded-xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-text">{vol.fullName}</div>
                  <div className="font-mono text-xs text-text-muted tabular-nums">{vol.code}</div>
                </div>
                <StatusBadge status={vol.registrationStatus} context="volunteer" />
              </div>

              <div className="text-xs space-y-1.5 pt-1 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-text-muted">Divisi:</span>
                  <span className="font-medium text-text">
                    {vol.division?.name || 'Belum Ditentukan'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Ukuran Kaos:</span>
                  <span className="font-mono font-bold text-text">
                    {vol.shirtSize || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Presensi Shift:</span>
                  {checkedIn ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Sudah Check-in
                    </span>
                  ) : (
                    <span className="text-[11px] text-text-muted">Belum Check-in</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedVolunteerForIdCard(vol)}
                  className="px-3 py-1.5 text-xs font-semibold text-accent dark:text-[#FFC46B] bg-accent-subtle rounded-lg border border-accent/25 flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" /> ID Card Pas
                </button>

                {vol.registrationStatus === 'PENDING' && canApprove && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(vol.id, 'APPROVED')}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terima
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(vol.id, 'REJECTED')}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Volunteer Official ID Card / Lanyard Modal */}
      {selectedVolunteerForIdCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-accent/30 space-y-5 text-center relative overflow-hidden">
            {/* Top Lanyard Punch hole */}
            <div className="w-12 h-3.5 bg-surface-muted rounded-full mx-auto border border-border mb-2" />

            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#FFC46B] bg-[#2A1411] px-3 py-1 rounded-full inline-block border border-accent/30">
                Official Staff & Volunteer Pass
              </div>
              <h3 className="text-lg font-extrabold text-text">
                EventOps Management
              </h3>
            </div>

            {/* Profile badge */}
            <div className="py-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7A2E33] to-[#4A171B] text-[#FFC46B] font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md border border-[#7A2E33]/50">
                {selectedVolunteerForIdCard.fullName.slice(0, 2).toUpperCase()}
              </div>
              <h4 className="text-base font-bold text-text mt-3">
                {selectedVolunteerForIdCard.fullName}
              </h4>
              <div className="font-mono text-xs font-semibold text-text-muted mt-0.5">
                {selectedVolunteerForIdCard.code}
              </div>
            </div>

            {/* Division Badge & Specs */}
            <div className="bg-surface-muted rounded-2xl p-3 border border-border text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Divisi:</span>
                <span className="font-bold text-accent dark:text-[#FFC46B]">
                  {selectedVolunteerForIdCard.division?.name || 'Umum'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Ukuran Kaos:</span>
                <span className="font-mono font-bold text-text">
                  {selectedVolunteerForIdCard.shirtSize || 'L'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Status Validasi:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Terverifikasi Resmi</span>
              </div>
            </div>

            {/* High fidelity QR Code representation */}
            <div className="bg-white p-3 rounded-2xl border-2 border-dashed border-border inline-block shadow-inner">
              <div className="w-32 h-32 flex flex-col items-center justify-center bg-[#1B0E0D] rounded-xl text-white p-2">
                <QrCode className="w-20 h-20 text-[#FFC46B]" />
                <span className="font-mono text-[9px] mt-1 text-zinc-300">
                  {selectedVolunteerForIdCard.code}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-accent/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak ID Card</span>
              </button>
              <button
                onClick={() => setSelectedVolunteerForIdCard(null)}
                className="px-4 py-2 bg-surface-muted hover:bg-border text-text text-xs font-semibold rounded-xl border border-border"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
