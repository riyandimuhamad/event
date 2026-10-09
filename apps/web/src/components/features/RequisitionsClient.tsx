'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Play,
  CheckSquare,
  Lock,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface RequisitionItem {
  id: string;
  name: string;
  quantity: string | number;
  unit: string;
}

interface RequisitionEvent {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  actorId: string;
  reason: string | null;
  createdAt: string | Date;
}

interface RequisitionData {
  id: string;
  code: string;
  title: string;
  description: string | null;
  fromDivisionId: string;
  toDivisionId: string;
  priority: string;
  status: string;
  neededBy: string | Date | null;
  requestedBy: string;
  fromDivision: { id: string; name: string; code: string };
  toDivision: { id: string; name: string; code: string };
  requester: { fullName: string; email: string };
  items: RequisitionItem[];
  events: RequisitionEvent[];
}

interface DivisionOption {
  id: string;
  name: string;
  code: string;
}

interface RequisitionsClientProps {
  initialRequisitions: RequisitionData[];
  divisions: DivisionOption[];
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

export function RequisitionsClient({
  initialRequisitions,
  divisions,
  actor,
  orgSlug,
  eventId,
}: RequisitionsClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New requisition form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFromDiv, setNewFromDiv] = useState(actor.divisionId || (divisions[0]?.id || ''));
  const [newToDiv, setNewToDiv] = useState(
    divisions.find((d) => d.id !== actor.divisionId)?.id || (divisions[1]?.id || '')
  );
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newItems, setNewItems] = useState<Array<{ name: string; quantity: number; unit: string }>>([
    { name: '', quantity: 1, unit: 'unit' },
  ]);

  const filtered = initialRequisitions.filter((r) => {
    if (tab === 'incoming') {
      return actor.divisionId ? r.toDivisionId === actor.divisionId : true;
    }
    if (tab === 'outgoing') {
      return actor.divisionId ? r.fromDivisionId === actor.divisionId : true;
    }
    return true;
  });

  const handleTransition = async (id: string, targetStatus: string, reason?: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `/api/v1/requisitions/${id}/transitions?orgSlug=${orgSlug}&eventId=${eventId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: targetStatus, reason }),
        }
      );

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Gagal mengubah status');
      }

      setRejectingReqId(null);
      setRejectReason('');
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const validItems = newItems.filter((i) => i.name.trim().length > 0);
      if (validItems.length === 0) {
        throw new Error('Minimal tambahkan 1 item kebutuhan.');
      }

      const res = await fetch(`/api/v1/requisitions?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          fromDivisionId: newFromDiv,
          toDivisionId: newToDiv,
          priority: newPriority,
          items: validItems,
          submitImmediately: true, // Directly submit for smooth UX
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Gagal membuat kebutuhan');
      }

      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewItems([{ name: '', quantity: 1, unit: 'unit' }]);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('requisition.title')}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">{t('requisition.subtitle')}</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('requisition.createNew')}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Perhatian</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setTab('all')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Semua Kebutuhan ({initialRequisitions.length})
        </button>
        <button
          onClick={() => setTab('incoming')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'incoming'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {t('requisition.tabIncoming')}
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'outgoing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {t('requisition.tabOutgoing')}
        </button>
      </div>

      {/* List Cards per design.md Section 5.4 */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-800 border border-border rounded-xl text-zinc-500 text-sm">
            {t('common.noData')}
          </div>
        ) : (
          filtered.map((req) => {
            const isTargetDiv = actor.divisionId === req.toDivisionId;
            const isSourceDiv = actor.divisionId === req.fromDivisionId;
            const isManagerOrOwner =
              actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm hover:border-zinc-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                        {req.code}
                      </span>
                      <StatusBadge status={req.status} context="requisition" />
                      <StatusBadge status={req.priority} context="priority" />
                      <span className="text-xs text-zinc-400">
                        Oleh: {req.requester.fullName}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {req.title}
                    </h2>

                    {req.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {req.description}
                      </p>
                    )}

                    {/* From -> To division badge */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 pt-1">
                      <span className="bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
                        {req.fromDivision.name} ({req.fromDivision.code})
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 px-2 py-1 rounded">
                        {req.toDivision.name} ({req.toDivision.code})
                      </span>
                    </div>

                    {/* Items table summary */}
                    <div className="pt-2">
                      <div className="text-xs font-semibold text-zinc-500 mb-1">
                        Daftar Kebutuhan ({req.items.length} item):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {req.items.map((itm) => (
                          <span
                            key={itm.id}
                            className="text-xs bg-zinc-50 dark:bg-zinc-700/50 border border-border px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-200"
                          >
                            <strong>{itm.quantity}</strong> {itm.unit} — {itm.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap lg:flex-col items-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                    {/* Submit (if DRAFT) */}
                    {req.status === 'DRAFT' && (isSourceDiv || isManagerOrOwner) && (
                      <button
                        onClick={() => handleTransition(req.id, 'SUBMITTED')}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ajukan Kebutuhan</span>
                      </button>
                    )}

                    {/* Approve / Reject (if SUBMITTED and user has authority) */}
                    {req.status === 'SUBMITTED' && (isTargetDiv || isManagerOrOwner) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTransition(req.id, 'APPROVED')}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('requisition.approve')}</span>
                        </button>
                        <button
                          onClick={() => setRejectingReqId(req.id)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t('requisition.reject')}</span>
                        </button>
                      </div>
                    )}

                    {/* Start In Progress (if APPROVED) */}
                    {req.status === 'APPROVED' && (isTargetDiv || isManagerOrOwner) && (
                      <button
                        onClick={() => handleTransition(req.id, 'IN_PROGRESS')}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{t('requisition.startProgress')}</span>
                      </button>
                    )}

                    {/* Fulfill (if IN_PROGRESS) */}
                    {req.status === 'IN_PROGRESS' && (isTargetDiv || isManagerOrOwner) && (
                      <button
                        onClick={() => handleTransition(req.id, 'FULFILLED')}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{t('requisition.fulfill')}</span>
                      </button>
                    )}

                    {/* Close (if FULFILLED and from division) */}
                    {req.status === 'FULFILLED' && (isSourceDiv || isManagerOrOwner) && (
                      <button
                        onClick={() => handleTransition(req.id, 'CLOSED')}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-xs font-semibold bg-zinc-700 hover:bg-zinc-800 text-white rounded-lg flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t('requisition.closeRequisition')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal with >= 10 chars requirement */}
      {rejectingReqId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-border">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Tolak Pengajuan Kebutuhan
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Sesuai aturan bisnis, penolakan kebutuhan wajib menyertakan alasan penolakan tertulis
              minimal 10 karakter.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('requisition.rejectReasonPlaceholder')}
              rows={4}
              className="w-full text-sm rounded-lg border border-border p-3 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectingReqId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                {t('common.cancel')}
              </button>
              <button
                disabled={rejectReason.trim().length < 10 || isSubmitting}
                onClick={() => handleTransition(rejectingReqId, 'REJECTED', rejectReason)}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl max-w-xl w-full p-6 shadow-xl border border-border max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              {t('requisition.createNew')}
            </h3>

            <form onSubmit={handleCreateRequisition} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Judul Kebutuhan
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Panggung Utama & Sound System 20k Watt"
                  className="w-full text-sm rounded-lg border border-border p-2.5 bg-zinc-50 dark:bg-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t('requisition.fromDivision')}
                  </label>
                  <select
                    value={newFromDiv}
                    onChange={(e) => setNewFromDiv(e.target.value)}
                    className="w-full text-sm rounded-lg border border-border p-2 bg-zinc-50 dark:bg-zinc-900"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t('requisition.toDivision')}
                  </label>
                  <select
                    value={newToDiv}
                    onChange={(e) => setNewToDiv(e.target.value)}
                    className="w-full text-sm rounded-lg border border-border p-2 bg-zinc-50 dark:bg-zinc-900"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Prioritas Kebutuhan
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full text-sm rounded-lg border border-border p-2 bg-zinc-50 dark:bg-zinc-900"
                >
                  <option value="LOW">Rendah (LOW)</option>
                  <option value="MEDIUM">Sedang (MEDIUM)</option>
                  <option value="HIGH">Tinggi (HIGH)</option>
                  <option value="URGENT">Mendesak (URGENT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Deskripsi / Catatan Tambahan
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detail spesifikasi teknis atau instruksi khusus..."
                  rows={2}
                  className="w-full text-sm rounded-lg border border-border p-2 bg-zinc-50 dark:bg-zinc-900"
                />
              </div>

              {/* Items Section */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Item Kebutuhan
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewItems([...newItems, { name: '', quantity: 1, unit: 'pcs' }])
                    }
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    + Tambah Item
                  </button>
                </div>

                <div className="space-y-2">
                  {newItems.map((itm, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nama barang / jasa"
                        value={itm.name}
                        onChange={(e) => {
                          const copy = [...newItems];
                          copy[idx].name = e.target.value;
                          setNewItems(copy);
                        }}
                        className="flex-1 text-sm rounded-lg border border-border p-2 bg-zinc-50 dark:bg-zinc-900"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={itm.quantity}
                        onChange={(e) => {
                          const copy = [...newItems];
                          copy[idx].quantity = Number(e.target.value);
                          setNewItems(copy);
                        }}
                        className="w-20 text-sm rounded-lg border border-border p-2 bg-zinc-50 dark:bg-zinc-900"
                      />
                      <input
                        type="text"
                        placeholder="Satuan"
                        value={itm.unit}
                        onChange={(e) => {
                          const copy = [...newItems];
                          copy[idx].unit = e.target.value;
                          setNewItems(copy);
                        }}
                        className="w-24 text-sm rounded-lg border border-border p-2 bg-zinc-50 dark:bg-zinc-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  {t('common.save')} & Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
