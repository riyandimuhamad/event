'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Truck, Phone, Mail, FileText, Users, Trash2, X, AlertCircle, UserPlus } from 'lucide-react';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface VendorCrewData {
  id: string;
  fullName: string;
  role: string;
  phone: string | null;
  status: string;
}

interface VendorOrderData {
  id: string;
  description: string;
  amount: bigint | number;
  status: string;
}

interface VendorData {
  id: string;
  name: string;
  category: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  orders: VendorOrderData[];
  crews: VendorCrewData[];
}

interface VendorsClientProps {
  initialVendors: VendorData[];
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

export function VendorsClient({
  initialVendors,
  actor,
  orgSlug,
  eventId,
}: VendorsClientProps) {
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorData[]>(initialVendors);

  // Vendor modal state
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('SOUND');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Crew modal state
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [selectedVendorForCrew, setSelectedVendorForCrew] = useState<VendorData | null>(null);
  const [crewName, setCrewName] = useState('');
  const [crewRole, setCrewRole] = useState('');
  const [crewPhone, setCrewPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canManage = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/vendors?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vendorName,
          category: vendorCategory,
          contactName,
          contactPhone: contactPhone || undefined,
          contactEmail: contactEmail || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menambah vendor');

      setIsVendorModalOpen(false);
      setVendorName('');
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      router.refresh();

      setVendors((prev) => [...prev, { ...json.data, orders: [], crews: [] }]);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForCrew) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/vendors/${selectedVendorForCrew.id}/crews?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: crewName,
          role: crewRole,
          phone: crewPhone || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menambah kru vendor');

      setIsCrewModalOpen(false);
      setCrewName('');
      setCrewRole('');
      setCrewPhone('');
      router.refresh();

      setVendors((prev) =>
        prev.map((v) =>
          v.id === selectedVendorForCrew.id
            ? { ...v, crews: [...v.crews, json.data] }
            : v
        )
      );
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVendor = async (vendor: VendorData) => {
    if (!confirm(`Hapus vendor ${vendor.name}? Semua pesanan dan data kru terkait akan terhapus.`)) return;

    try {
      const res = await fetch(`/api/v1/vendors/${vendor.id}?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menghapus vendor');

      setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
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
          <h1 className="text-2xl font-bold text-text">{t('nav.vendors')}</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Mitra vendor eksternal, pesanan logistik, dan daftar kru lapangan ({vendors.length} vendor)
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsVendorModalOpen(true)}
            className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Vendor Baru</span>
          </button>
        )}
      </div>

      {/* Grid of Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vendors.map((v) => (
          <div
            key={v.id}
            className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-accent/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-muted text-text-muted border border-border">
                    {v.category}
                  </span>
                  <h2 className="text-lg font-bold text-text mt-1.5">{v.name}</h2>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  {canManage && (
                    <button
                      onClick={() => handleDeleteVendor(v)}
                      title="Hapus Vendor"
                      className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-text-muted space-y-1 mt-3">
                <div>
                  PIC / Kontak: <strong className="text-text">{v.contactName}</strong>
                </div>
                {v.contactPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-text-muted" />
                    <span>{v.contactPhone}</span>
                  </div>
                )}
                {v.contactEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-text-muted" />
                    <span>{v.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-muted p-2 rounded-xl border border-border">
                  <span className="text-text-muted block flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    Pesanan Aktif:
                  </span>
                  <span className="font-bold text-text mt-0.5 block">
                    {v.orders?.length || 0} order
                  </span>
                </div>
                <div className="bg-surface-muted p-2 rounded-xl border border-border">
                  <span className="text-text-muted block flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    Kru Terdaftar:
                  </span>
                  <span className="font-bold text-text mt-0.5 block">
                    {v.crews?.length || 0} orang
                  </span>
                </div>
              </div>

              {canManage && (
                <button
                  onClick={() => {
                    setSelectedVendorForCrew(v);
                    setIsCrewModalOpen(true);
                  }}
                  className="w-full py-1.5 bg-surface-muted hover:bg-border text-text text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-border transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-accent" />
                  <span>Daftarkan Kru Vendor</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Vendor */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Tambah Vendor Baru</h3>
              <button
                onClick={() => setIsVendorModalOpen(false)}
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

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Perusahaan / Vendor *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: CV Berkah Sound Production"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Kategori Layanan *</label>
                <select
                  value={vendorCategory}
                  onChange={(e) => setVendorCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                >
                  <option value="SOUND">Sound System & Audio</option>
                  <option value="LIGHTING">Lighting & Tata Cahaya</option>
                  <option value="CATERING">Katering & F&B</option>
                  <option value="EQUIPMENT">Rigging, Tenda & Panggung</option>
                  <option value="SECURITY">Keamanan & Garda Lapangan</option>
                  <option value="MEDIA">Dokumentasi & Live Broadcast</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Nama Kontak Person (PIC) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hendra Gunawan"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Nomor Telepon / WA</label>
                  <input
                    type="tel"
                    placeholder="081288991122"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="vendor@mail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Kru Vendor */}
      {isCrewModalOpen && selectedVendorForCrew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text">Daftarkan Kru Lapangan</h3>
                <p className="text-text-muted text-xs">Untuk {selectedVendorForCrew.name}</p>
              </div>
              <button
                onClick={() => setIsCrewModalOpen(false)}
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

            <form onSubmit={handleCreateCrew} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Lengkap Kru *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dani Suhendra"
                  value={crewName}
                  onChange={(e) => setCrewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Peran / Tugas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Teknisi Kabel & Sound Engineer"
                  value={crewRole}
                  onChange={(e) => setCrewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Nomor Handphone</label>
                <input
                  type="tel"
                  placeholder="087700001001"
                  value={crewPhone}
                  onChange={(e) => setCrewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCrewModalOpen(false)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Kru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
