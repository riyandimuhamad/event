'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BadgeDollarSign, CheckCircle2, Clock, Trash2, X, AlertCircle, FileCheck } from 'lucide-react';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface SponsorDeliverableData {
  id: string;
  title: string;
  status: string;
  deliveredAt: string | null;
}

interface SponsorData {
  id: string;
  companyName: string;
  packageName: string;
  packageValue: number;
  paymentStatus: string;
  amountPaid: number;
  repName: string | null;
  repEmail: string | null;
  deliverables: SponsorDeliverableData[];
}

interface SponsorsClientProps {
  initialSponsors: SponsorData[];
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

export function SponsorsClient({
  initialSponsors,
  actor,
  orgSlug,
  eventId,
}: SponsorsClientProps) {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<SponsorData[]>(initialSponsors);

  // Sponsor modal state
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [packageName, setPackageName] = useState('Platinum Partner');
  const [packageValue, setPackageValue] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');

  // Deliverable modal state
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [selectedSponsorForDeliverable, setSelectedSponsorForDeliverable] = useState<SponsorData | null>(null);
  const [deliverableTitle, setDeliverableTitle] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canManage = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/sponsors?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          packageName,
          packageValue: Number(packageValue),
          amountPaid: amountPaid ? Number(amountPaid) : 0,
          repName: repName || undefined,
          repEmail: repEmail || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menambah sponsor');

      setIsSponsorModalOpen(false);
      setCompanyName('');
      setPackageValue('');
      setAmountPaid('');
      setRepName('');
      setRepEmail('');
      router.refresh();

      setSponsors((prev) => [...prev, { ...json.data, deliverables: [] }]);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSponsorForDeliverable) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/sponsors/${selectedSponsorForDeliverable.id}/deliverables?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: deliverableTitle,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menambah deliverable sponsor');

      setIsDeliverableModalOpen(false);
      setDeliverableTitle('');
      router.refresh();

      setSponsors((prev) =>
        prev.map((spn) =>
          spn.id === selectedSponsorForDeliverable.id
            ? { ...spn, deliverables: [...spn.deliverables, json.data] }
            : spn
        )
      );
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSponsor = async (sponsor: SponsorData) => {
    if (!confirm(`Hapus kemitraan sponsor ${sponsor.companyName}?`)) return;

    try {
      const res = await fetch(`/api/v1/sponsors/${sponsor.id}?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menghapus sponsor');

      setSponsors((prev) => prev.filter((s) => s.id !== sponsor.id));
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
          <h1 className="text-2xl font-bold text-text">{t('nav.sponsors')}</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Mitra sponsor, paket kerjasama, dan pemenuhan benefit deliverable ({sponsors.length} partner)
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsSponsorModalOpen(true)}
            className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sponsor Baru</span>
          </button>
        )}
      </div>

      {/* Grid of Sponsor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sponsors.map((spn) => (
          <div
            key={spn.id}
            className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-accent/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {spn.packageName}
                  </span>
                  <h2 className="text-base font-bold text-text mt-2">{spn.companyName}</h2>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                    <BadgeDollarSign className="w-4 h-4" />
                  </div>
                  {canManage && (
                    <button
                      onClick={() => handleDeleteSponsor(spn)}
                      title="Hapus Sponsor"
                      className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Nilai Kontrak:</span>
                  <span className="font-bold tabular-nums text-text">
                    Rp {spn.packageValue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Terealisasi:</span>
                  <span className="font-semibold tabular-nums text-emerald-700">
                    Rp {spn.amountPaid.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-text-muted">Status Bayar:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      spn.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : spn.paymentStatus === 'PARTIAL'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {spn.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-xs font-semibold text-text block">
                Deliverables ({spn.deliverables.filter((d) => d.status === 'DELIVERED').length}/
                {spn.deliverables.length}):
              </span>
              <ul className="space-y-1">
                {spn.deliverables.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-1.5 text-xs text-text-muted bg-surface-muted p-1.5 rounded-lg border border-border"
                  >
                    {d.status === 'DELIVERED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <span className="line-clamp-1">{d.title}</span>
                  </li>
                ))}
                {spn.deliverables.length === 0 && (
                  <li className="text-xs text-text-muted italic">Belum ada deliverable</li>
                )}
              </ul>

              {canManage && (
                <button
                  onClick={() => {
                    setSelectedSponsorForDeliverable(spn);
                    setIsDeliverableModalOpen(true);
                  }}
                  className="w-full py-1.5 bg-surface-muted hover:bg-border text-text text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-border transition-colors mt-2"
                >
                  <FileCheck className="w-3.5 h-3.5 text-accent" />
                  <span>Tambah Deliverable</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Sponsor */}
      {isSponsorModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Tambah Sponsor Baru</h3>
              <button
                onClick={() => setIsSponsorModalOpen(false)}
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

            <form onSubmit={handleCreateSponsor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Perusahaan / Brand *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Bank Central Asia"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Nama Paket Kemitraan *</label>
                <select
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                >
                  <option value="Platinum Partner">Platinum Partner</option>
                  <option value="Gold Partner">Gold Partner</option>
                  <option value="Silver Partner">Silver Partner</option>
                  <option value="Bronze Partner">Bronze Partner</option>
                  <option value="Official Beverage">Official Beverage</option>
                  <option value="Official Banking">Official Banking</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Nilai Kontrak (Rp) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 100000000"
                    value={packageValue}
                    onChange={(e) => setPackageValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Uang Muka / Dibayar (Rp)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 50000000"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Nama PIC Sponsor</label>
                  <input
                    type="text"
                    placeholder="Contoh: Maya Safira"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Email PIC</label>
                  <input
                    type="email"
                    placeholder="pic@perusahaan.co.id"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsSponsorModalOpen(false)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Deliverable */}
      {isDeliverableModalOpen && selectedSponsorForDeliverable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text">Tambah Deliverable Kemitraan</h3>
                <p className="text-text-muted text-xs">Untuk {selectedSponsorForDeliverable.companyName}</p>
              </div>
              <button
                onClick={() => setIsDeliverableModalOpen(false)}
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

            <form onSubmit={handleCreateDeliverable} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Judul / Bentuk Benefit *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penayangan Video Promosi 60 Detik di LED Screen"
                  value={deliverableTitle}
                  onChange={(e) => setDeliverableTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsDeliverableModalOpen(false)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
