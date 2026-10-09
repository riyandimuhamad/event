'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ShieldCheck,
  Phone,
  Mail,
  Trash2,
  X,
  AlertCircle,
  Building,
  Pencil,
  Lock,
  CheckSquare,
  Square,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface CommitteeMemberData {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  confirmed: boolean;
  divisionId: string;
  division: { id: string; name: string; code: string };
  allowedModules?: string[];
}

interface DivisionOption {
  id: string;
  name: string;
  code: string;
}

interface CommitteeClientProps {
  initialCommittee: CommitteeMemberData[];
  divisions: DivisionOption[];
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

// System menu modules that can be toggled per member
const SYSTEM_MODULES = [
  { id: 'overview', name: 'Overview Event', desc: 'Ringkasan KPI & status acara' },
  { id: 'divisions', name: 'Divisi & Panitia', desc: 'Struktur divisi & daftar panitia' },
  { id: 'volunteers', name: 'Volunteer', desc: 'Pendaftaran, presensi & shift volunteer' },
  { id: 'requisitions', name: 'Requisisi & Anggaran', desc: 'Pengajuan kebutuhan & anggaran' },
  { id: 'vendors', name: 'Vendor & Logistik', desc: 'Katering, sound system, & perlengkapan' },
  { id: 'talents', name: 'Talent & Artis', desc: 'Rider, jadwal soundcheck & kontrak' },
  { id: 'sponsors', name: 'Sponsor & Partnership', desc: 'Deliverables & status sponsor' },
  { id: 'phases', name: 'Pra / Hari H / Pasca Event', desc: 'Checkin hari H & konsumsi' },
];

export function CommitteeClient({
  initialCommittee,
  divisions,
  actor,
  orgSlug,
  eventId,
}: CommitteeClientProps) {
  const router = useRouter();
  const [committee, setCommittee] = useState<CommitteeMemberData[]>(initialCommittee);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Create State
  const [fullName, setFullName] = useState('');
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || '');
  const [position, setPosition] = useState('Staf Divisi');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [allowedModules, setAllowedModules] = useState<string[]>([
    'overview',
    'divisions',
    'volunteers',
    'vendors',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Edit & Access Control Modal State
  const [editingMember, setEditingMember] = useState<CommitteeMemberData | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editDivisionId, setEditDivisionId] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editModules, setEditModules] = useState<string[]>([]);
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  const canManage =
    actor.orgRole === 'OWNER' ||
    actor.eventRole === 'EVENT_MANAGER' ||
    actor.eventRole === 'DIVISION_HEAD';

  const canViewSensitiveContacts =
    actor.orgRole === 'OWNER' ||
    actor.eventRole === 'EVENT_MANAGER' ||
    actor.eventRole === 'DIVISION_HEAD';

  const toggleModuleSelection = (moduleId: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditModules((prev) =>
        prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
      );
    } else {
      setAllowedModules((prev) =>
        prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
      );
    }
  };

  const selectAllModules = (isEdit: boolean = false) => {
    const all = SYSTEM_MODULES.map((m) => m.id);
    if (isEdit) setEditModules(all);
    else setAllowedModules(all);
  };

  const openEditModal = (member: CommitteeMemberData) => {
    setEditingMember(member);
    setEditFullName(member.fullName);
    setEditDivisionId(member.divisionId);
    setEditPosition(member.position || 'Staf Divisi');
    setEditEmail(member.email || '');
    setEditPhone(member.phone || '');

    // Default or inferred module access
    let mods = ['overview', 'divisions', 'volunteers', 'vendors'];
    const p = (member.position || '').toLowerCase();
    if (p.includes('ketua') || p.includes('wakil') || p.includes('owner') || p.includes('manager')) {
      mods = SYSTEM_MODULES.map((m) => m.id);
    } else if (p.includes('sponsor') || p.includes('talent') || p.includes('vendor')) {
      mods = ['overview', 'sponsors', 'talents', 'vendors', 'requisitions'];
    }
    setEditModules(mods);
    setEditErrorMessage(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formattedPosition = position.trim() || 'Staf Divisi';

    try {
      const res = await fetch(`/api/v1/committee?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          divisionId,
          position: formattedPosition,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menambah panitia');

      setIsModalOpen(false);
      setFullName('');
      setPosition('Staf Divisi');
      setEmail('');
      setPhone('');
      router.refresh();

      const newMember: CommitteeMemberData = {
        ...json.data,
        division: divisions.find((d) => d.id === divisionId) || { id: divisionId, name: 'Divisi', code: 'DIV' },
        allowedModules: allowedModules,
      };
      setCommittee((prev) => [...prev, newMember]);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsEditingSubmitting(true);
    setEditErrorMessage(null);

    const formattedPosition = editPosition.trim() || 'Staf Divisi';

    try {
      const res = await fetch(`/api/v1/committee/${editingMember.id}?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFullName,
          divisionId: editDivisionId,
          position: formattedPosition,
          email: editEmail || null,
          phone: editPhone || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal memperbarui hak akses panitia');

      setEditingMember(null);
      router.refresh();

      const updatedMember: CommitteeMemberData = {
        ...editingMember,
        fullName: editFullName,
        divisionId: editDivisionId,
        position: formattedPosition,
        email: editEmail || null,
        phone: editPhone || null,
        division: divisions.find((d) => d.id === editDivisionId) || editingMember.division,
        allowedModules: editModules,
      };

      setCommittee((prev) => prev.map((c) => (c.id === editingMember.id ? updatedMember : c)));
    } catch (err: unknown) {
      setEditErrorMessage((err as Error).message);
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  const handleDelete = async (member: CommitteeMemberData) => {
    if (!confirm(`Hapus ${member.fullName} (${member.division.name}) dari struktur kepanitiaan?`)) return;

    try {
      const res = await fetch(`/api/v1/committee/${member.id}?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menghapus panitia');

      setCommittee((prev) => prev.filter((c) => c.id !== member.id));
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
          <h1 className="text-2xl font-bold text-text">{t('nav.committee')}</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Struktur panitia &amp; pengaturan hak akses per-menu (Sponsor, Talent, Vendor, Volunteer, Divisi, dll)
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Panitia Inti</span>
          </button>
        )}
      </div>

      {/* Committee Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nama Panitia</th>
                <th className="px-6 py-3.5">Divisi Penugasan</th>
                <th className="px-6 py-3.5">Jabatan / Posisi</th>
                <th className="px-6 py-3.5">Matriks Hak Akses Menu Modul</th>
                <th className="px-6 py-3.5">Kontak</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {committee.map((c) => {
                const pos = (c.position || '').toLowerCase();
                const isFullAccess = pos.includes('ketua') || pos.includes('wakil') || pos.includes('owner') || pos.includes('manager');
                const isSponsorTalent = pos.includes('sponsor') || pos.includes('talent') || pos.includes('humas');

                return (
                  <tr key={c.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        <span>{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-0.5 rounded-lg bg-surface-muted text-text font-bold border border-border">
                        <Building className="w-3 h-3 text-text-muted" />
                        {c.division?.name || 'Umum'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text font-medium text-xs">
                      {c.position || 'Staf Divisi'}
                    </td>
                    <td className="px-6 py-4">
                      {isFullAccess ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300">
                            Semua Menu (All Access)
                          </span>
                        </div>
                      ) : isSponsorTalent ? (
                        <div className="flex flex-wrap items-center gap-1 text-[10px] font-semibold">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200">Sponsor</span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200">Talent</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">Vendor</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1 text-[10px] font-semibold">
                          <span className="px-2 py-0.5 rounded-md bg-surface-muted text-text-muted border border-border">Overview</span>
                          <span className="px-2 py-0.5 rounded-md bg-surface-muted text-text-muted border border-border">Divisi</span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">Volunteer</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {canViewSensitiveContacts ? (
                        <div className="space-y-0.5">
                          {c.email && (
                            <div className="flex items-center gap-1.5 text-text">
                              <Mail className="w-3 h-3 text-text-muted" />
                              <span>{c.email}</span>
                            </div>
                          )}
                          {c.phone && (
                            <div className="flex items-center gap-1.5 text-text-muted">
                              <Phone className="w-3 h-3 text-text-muted" />
                              <span>{c.phone}</span>
                            </div>
                          )}
                          {!c.email && !c.phone && <span className="text-text-muted">-</span>}
                        </div>
                      ) : (
                        <span className="text-text-muted italic text-[11px]">
                          Kontak Terenkripsi (Hanya Manajer/Head)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canManage && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(c)}
                            title="Atur Hak Akses Menu Modul"
                            className="px-2.5 py-1 text-xs font-semibold text-accent border border-accent/30 hover:bg-accent-subtle rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Atur Hak Akses</span>
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            title="Hapus Panitia"
                            className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Panitia */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Tambah Panitia &amp; Hak Akses Menu</h3>
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
                <label className="block font-semibold text-text mb-1">Nama Lengkap Panitia *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Anggara"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Divisi Penugasan *</label>
                <select
                  required
                  value={divisionId}
                  onChange={(e) => setDivisionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                >
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Jabatan / Posisi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Koordinator Lapangan / Staf Teknis"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              {/* Module Checkbox Matrix */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-text">Matriks Hak Akses Menu Modul Sistem:</label>
                  <button
                    type="button"
                    onClick={() => selectAllModules(false)}
                    className="text-[11px] text-accent font-semibold hover:underline"
                  >
                    Pilih Semua Menu
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-muted p-3 rounded-xl border border-border">
                  {SYSTEM_MODULES.map((mod) => {
                    const isChecked = allowedModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModuleSelection(mod.id, false)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isChecked
                            ? 'bg-surface border-accent shadow-sm'
                            : 'bg-surface/50 border-border hover:border-text-subtle'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-xs text-text">{mod.name}</div>
                          <div className="text-[10px] text-text-muted">{mod.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="panitia@eventops.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">No. Handphone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Panitia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Panitia & Matriks Hak Akses Menu Modul */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent" />
                <h3 className="text-base font-bold text-text">Pengaturan Hak Akses Menu Modul</h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="text-text-muted hover:text-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Lengkap Panitia *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Divisi Penugasan *</label>
                <select
                  required
                  value={editDivisionId}
                  onChange={(e) => setEditDivisionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                >
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Jabatan / Posisi</label>
                <input
                  type="text"
                  required
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              {/* Module Checkbox Matrix */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-text">Matriks Hak Akses Menu Modul Sistem:</label>
                  <button
                    type="button"
                    onClick={() => selectAllModules(true)}
                    className="text-[11px] text-accent font-semibold hover:underline"
                  >
                    Pilih Semua Menu
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-muted p-3 rounded-xl border border-border">
                  {SYSTEM_MODULES.map((mod) => {
                    const isChecked = editModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModuleSelection(mod.id, true)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isChecked
                            ? 'bg-surface border-accent shadow-sm'
                            : 'bg-surface/50 border-border hover:border-text-subtle'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-xs text-text">{mod.name}</div>
                          <div className="text-[10px] text-text-muted">{mod.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">No. Handphone / WhatsApp</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditingSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isEditingSubmitting ? 'Menyimpan...' : 'Simpan Hak Akses'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
