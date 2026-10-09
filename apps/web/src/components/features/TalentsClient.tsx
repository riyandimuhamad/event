'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Music2, Clock, Calendar, FileText, Trash2, X, AlertCircle } from 'lucide-react';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface TalentShowData {
  id: string;
  stageName: string;
  startsAt: string;
  endsAt: string;
}

interface TalentData {
  id: string;
  name: string;
  category: string;
  managementName: string | null;
  managementContact: string | null;
  managementEmail: string | null;
  riderNotes: string | null;
  fee: number | null;
  contractStatus: string;
  shows: TalentShowData[];
}

interface TalentsClientProps {
  initialTalents: TalentData[];
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

export function TalentsClient({
  initialTalents,
  actor,
  orgSlug,
  eventId,
}: TalentsClientProps) {
  const router = useRouter();
  const [talents, setTalents] = useState<TalentData[]>(initialTalents);

  // Talent modal state
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Musik');
  const [managementName, setManagementName] = useState('');
  const [managementContact, setManagementContact] = useState('');
  const [riderNotes, setRiderNotes] = useState('');
  const [fee, setFee] = useState('');

  // Show modal state
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [selectedTalentForShow, setSelectedTalentForShow] = useState<TalentData | null>(null);
  const [stageName, setStageName] = useState('Panggung Utama (Main Stage)');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canManage = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

  const handleCreateTalent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/talents?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          managementName: managementName || undefined,
          managementContact: managementContact || undefined,
          riderNotes: riderNotes || undefined,
          fee: fee ? Number(fee) : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menambah talent');

      setIsTalentModalOpen(false);
      setName('');
      setManagementName('');
      setManagementContact('');
      setRiderNotes('');
      setFee('');
      router.refresh();

      setTalents((prev) => [...prev, { ...json.data, shows: [] }]);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTalentForShow) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/talents/${selectedTalentForShow.id}/shows?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageName,
          startsAt: startsAt || new Date().toISOString(),
          endsAt: endsAt || new Date().toISOString(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menambah jadwal pertunjukan');

      setIsShowModalOpen(false);
      setStartsAt('');
      setEndsAt('');
      router.refresh();

      setTalents((prev) =>
        prev.map((tlt) =>
          tlt.id === selectedTalentForShow.id
            ? { ...tlt, shows: [...tlt.shows, json.data] }
            : tlt
        )
      );
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTalent = async (talent: TalentData) => {
    if (!confirm(`Hapus talent ${talent.name}? Semua jadwal tampil akan dihapus.`)) return;

    try {
      const res = await fetch(`/api/v1/talents/${talent.id}?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menghapus talent');

      setTalents((prev) => prev.filter((tlt) => tlt.id !== talent.id));
      router.refresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('nav.talents')}</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Pengisi acara, jadwal pertunjukan (showtime), dan rider teknis ({talents.length} artis/bintang tamu)
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsTalentModalOpen(true)}
            className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Talent Baru</span>
          </button>
        )}
      </div>

      {/* Grid of Talent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {talents.map((tlt) => (
          <div
            key={tlt.id}
            className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-accent/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-subtle text-accent border border-accent/25">
                    {tlt.category}
                  </span>
                  <h2 className="text-lg font-bold text-text mt-1.5">{tlt.name}</h2>
                  <div className="text-xs text-text-muted mt-0.5">
                    Manajemen: {tlt.managementName || '-'} ({tlt.managementContact || '-'})
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center">
                    <Music2 className="w-4 h-4" />
                  </div>
                  {canManage && (
                    <button
                      onClick={() => handleDeleteTalent(tlt)}
                      title="Hapus Talent"
                      className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {tlt.riderNotes && (
                <div className="p-3 bg-surface-muted rounded-xl text-xs text-text-muted border border-border mt-3">
                  <span className="font-semibold block text-text mb-0.5">
                    Catatan Rider Teknis:
                  </span>
                  <p className="line-clamp-2">{tlt.riderNotes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  Jadwal Tampil ({tlt.shows?.length || 0}):
                </span>
                {tlt.shows && tlt.shows.length > 0 ? (
                  <div className="space-y-1">
                    {tlt.shows.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between text-xs bg-surface-muted p-2 rounded-xl border border-border font-mono"
                      >
                        <span className="font-semibold text-text">{s.stageName}</span>
                        <span className="text-text-muted">
                          {new Date(s.startsAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(s.endsAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-text-muted italic block">Belum ada jadwal tampil</span>
                )}
              </div>

              {canManage && (
                <button
                  onClick={() => {
                    setSelectedTalentForShow(tlt);
                    setIsShowModalOpen(true);
                  }}
                  className="w-full py-1.5 bg-surface-muted hover:bg-border text-text text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-border transition-colors mt-2"
                >
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span>Tambah Jadwal Showtime</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Talent */}
      {isTalentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Tambah Talent Baru</h3>
              <button
                onClick={() => setIsTalentModalOpen(false)}
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

            <form onSubmit={handleCreateTalent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Talent / Band *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sheila on 7 / Raisa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Kategori / Genre *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pop Rock / Jazz / Indie"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Nama Manajemen</label>
                  <input
                    type="text"
                    placeholder="Contoh: 507 Management"
                    value={managementName}
                    onChange={(e) => setManagementName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Kontak Person / Telp</label>
                  <input
                    type="tel"
                    placeholder="081299001122"
                    value={managementContact}
                    onChange={(e) => setManagementContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Catatan Rider Teknis & Hospitalities</label>
                <textarea
                  rows={2}
                  placeholder="Kebutuhan teknis monitor, microphone wireless, dan ruang tunggu VIP..."
                  value={riderNotes}
                  onChange={(e) => setRiderNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsTalentModalOpen(false)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Talent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Showtime */}
      {isShowModalOpen && selectedTalentForShow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text">Jadwalkan Showtime</h3>
                <p className="text-text-muted text-xs">Untuk {selectedTalentForShow.name}</p>
              </div>
              <button
                onClick={() => setIsShowModalOpen(false)}
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

            <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Panggung / Stage *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Panggung Utama (Main Stage)"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Waktu Mulai *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Waktu Selesai *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsShowModalOpen(false)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Menjadwalkan...' : 'Simpan Showtime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
