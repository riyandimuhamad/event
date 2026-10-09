'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users2, Shield, HeartHandshake, GitPullRequestDraft, Trash2, X, AlertCircle } from 'lucide-react';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface DivisionData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  headUserId: string | null;
  headUser: { id: string; fullName: string; email: string | null } | null;
  _count: {
    committeeMembers: number;
    volunteers: number;
    requisitionsFrom: number;
    requisitionsTo: number;
  };
}

interface UserOption {
  id: string;
  fullName: string;
  email: string | null;
}

interface DivisionsClientProps {
  initialDivisions: DivisionData[];
  users: UserOption[];
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

export function DivisionsClient({
  initialDivisions,
  users,
  actor,
  orgSlug,
  eventId,
}: DivisionsClientProps) {
  const router = useRouter();
  const [divisions, setDivisions] = useState<DivisionData[]>(initialDivisions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [headUserId, setHeadUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canManage = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/divisions?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          description,
          headUserId: headUserId || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Gagal membuat divisi');
      }

      setIsModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
      setHeadUserId('');
      router.refresh();
      // Optimistic update
      const newDiv: DivisionData = {
        ...json.data,
        headUser: users.find((u) => u.id === headUserId) || null,
        _count: {
          committeeMembers: 0,
          volunteers: 0,
          requisitionsFrom: 0,
          requisitionsTo: 0,
        },
      };
      setDivisions((prev) => [...prev, newDiv]);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (division: DivisionData) => {
    const totalDeps =
      division._count.committeeMembers +
      division._count.volunteers +
      division._count.requisitionsFrom +
      division._count.requisitionsTo;

    if (totalDeps > 0) {
      alert(
        `[Aturan B2] Divisi ${division.name} tidak dapat dihapus karena masih memiliki relasi aktif:\n- Panitia: ${division._count.committeeMembers} orang\n- Relawan: ${division._count.volunteers} orang\n- Kebutuhan: ${division._count.requisitionsFrom + division._count.requisitionsTo} aktif.\n\nPindahkan atau selesaikan relasi terlebih dahulu.`
      );
      return;
    }

    if (!confirm(`Hapus divisi ${division.name} (${division.code})?`)) return;

    try {
      const res = await fetch(`/api/v1/divisions/${division.id}?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menghapus divisi');

      setDivisions((prev) => prev.filter((d) => d.id !== division.id));
      router.refresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('nav.divisions')}</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Unit kerja operasional dalam pelaksanaan event ({divisions.length} divisi aktif)
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Divisi Baru</span>
          </button>
        )}
      </div>

      {/* Grid of Division Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {divisions.map((d) => (
          <div
            key={d.id}
            className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-accent/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-accent bg-accent-subtle px-2.5 py-0.5 rounded-lg border border-accent/25">
                    {d.code}
                  </span>
                  <h2 className="text-lg font-bold text-text mt-2">{d.name}</h2>
                </div>
                {canManage && (
                  <button
                    onClick={() => handleDelete(d)}
                    title="Hapus Divisi"
                    className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-text-muted mt-2 line-clamp-2">
                {d.description || 'Tidak ada deskripsi.'}
              </p>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  Kepala Divisi:
                </span>
                <span className="font-semibold text-text">
                  {d.headUser?.fullName || 'Belum Ditunjuk'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Users2 className="w-3.5 h-3.5 text-text-muted" />
                  Panitia Resmi:
                </span>
                <span className="font-bold text-text tabular-nums">
                  {d._count.committeeMembers} orang
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-text-muted" />
                  Relawan (Volunteer):
                </span>
                <span className="font-bold text-text tabular-nums">
                  {d._count.volunteers} orang
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1.5">
                  <GitPullRequestDraft className="w-3.5 h-3.5 text-text-muted" />
                  Kebutuhan Aktif:
                </span>
                <span className="font-bold text-text tabular-nums">
                  {d._count.requisitionsFrom + d._count.requisitionsTo} aktif
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Divisi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Tambah Divisi Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Divisi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Divisi Keamanan & Crowd Control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Kode Divisi (2-4 Huruf) *</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="Contoh: SEC"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text uppercase font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Kepala Divisi (Opsional)</label>
                <select
                  value={headUserId}
                  onChange={(e) => setHeadUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                >
                  <option value="">-- Pilih Kepala Divisi --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-text-muted mt-1">
                  Pilih penanggung jawab utama yang akan memimpin divisi ini.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Deskripsi Tugas</label>
                <textarea
                  rows={2}
                  placeholder="Tanggung jawab dan ruang lingkup divisi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Divisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
