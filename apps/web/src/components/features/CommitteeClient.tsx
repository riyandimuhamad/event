'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShieldCheck, Phone, Mail, Trash2, X, AlertCircle, Building } from 'lucide-react';
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
  const [fullName, setFullName] = useState('');
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || '');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canManage =
    actor.orgRole === 'OWNER' ||
    actor.eventRole === 'EVENT_MANAGER' ||
    actor.eventRole === 'DIVISION_HEAD';

  const canViewSensitiveContacts =
    actor.orgRole === 'OWNER' ||
    actor.eventRole === 'EVENT_MANAGER' ||
    actor.eventRole === 'DIVISION_HEAD';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/committee?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          divisionId,
          position: position || 'Staf Divisi',
          email: email || undefined,
          phone: phone || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menambah panitia');

      setIsModalOpen(false);
      setFullName('');
      setPosition('');
      setEmail('');
      setPhone('');
      router.refresh();

      const newMember: CommitteeMemberData = {
        ...json.data,
        division: divisions.find((d) => d.id === divisionId) || { id: divisionId, name: 'Divisi', code: 'DIV' },
      };
      setCommittee((prev) => [...prev, newMember]);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
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
            Struktur panitia inti penanggung jawab event ({committee.length} personil terkonfirmasi)
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
                <th className="px-6 py-3.5">Divisi</th>
                <th className="px-6 py-3.5">Jabatan / Posisi</th>
                <th className="px-6 py-3.5">Kontak</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {committee.map((c) => (
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
                  <td className="px-6 py-4 text-text-muted font-medium text-xs">
                    {c.position || 'Staf Divisi'}
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
                      <button
                        onClick={() => handleDelete(c)}
                        title="Hapus Panitia"
                        className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Panitia */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Tambah Panitia Inti</h3>
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
                  placeholder="Contoh: Koordinator Lapangan / Staf Teknis"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
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
    </div>
  );
}
