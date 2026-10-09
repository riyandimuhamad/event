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
  Layers,
  ArrowRight,
  AlertCircle,
  Clock,
  Trash2,
  Search,
  Filter,
  History,
  FileText,
  User,
  ShieldCheck,
  Building,
  CheckCircle,
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
  const [requisitions, setRequisitions] = useState<RequisitionData[]>(initialRequisitions);
  const [tab, setTab] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReqForDetail, setSelectedReqForDetail] = useState<RequisitionData | null>(null);
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

  // Statistics calculation
  const totalCount = requisitions.length;
  const pendingCount = requisitions.filter((r) => r.status === 'SUBMITTED').length;
  const inProgressCount = requisitions.filter((r) => r.status === 'IN_PROGRESS').length;
  const completedCount = requisitions.filter((r) => r.status === 'FULFILLED' || r.status === 'CLOSED').length;

  const filtered = requisitions.filter((r) => {
    if (tab === 'incoming') {
      if (actor.divisionId && r.toDivisionId !== actor.divisionId) return false;
    } else if (tab === 'outgoing') {
      if (actor.divisionId && r.fromDivisionId !== actor.divisionId) return false;
    }

    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = r.code.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchRequester = r.requester.fullName.toLowerCase().includes(q);
      const matchItem = r.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchCode && !matchTitle && !matchRequester && !matchItem) return false;
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

      // Optimistic/reactive update
      setRequisitions((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const updated = {
              ...item,
              status: targetStatus,
              events: [
                ...item.events,
                {
                  id: crypto.randomUUID(),
                  fromStatus: item.status,
                  toStatus: targetStatus,
                  actorId: actor.userId,
                  reason: reason || null,
                  createdAt: new Date().toISOString(),
                },
              ],
            };
            if (selectedReqForDetail?.id === id) {
              setSelectedReqForDetail(updated);
            }
            return updated;
          }
          return item;
        })
      );

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
          submitImmediately: true,
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
      // Reload page data
      window.location.reload();
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('requisition.title')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
            {t('requisition.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md hover:shadow-accent/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t('requisition.createNew')}</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
          <div className="text-xs font-medium text-text-muted">Total Kebutuhan</div>
          <div className="text-2xl font-bold text-text mt-1">{totalCount}</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Menunggu Approval
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">{pendingCount}</div>
        </div>
        <div className="p-4 rounded-xl border border-accent/20 bg-accent-subtle shadow-sm">
          <div className="text-xs font-semibold text-accent dark:text-[#FFC46B] flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5" /> Sedang Dikerjakan
          </div>
          <div className="text-2xl font-bold text-accent dark:text-[#FFC46B] mt-1">{inProgressCount}</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Terpenuhi & Ditutup
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">{completedCount}</div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Perhatian</div>
            <div className="text-xs mt-0.5">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-border bg-surface shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Direction Tabs */}
          <div className="flex bg-surface-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'all'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setTab('incoming')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'incoming'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {t('requisition.tabIncoming')}
            </button>
            <button
              onClick={() => setTab('outgoing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'outgoing'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {t('requisition.tabOutgoing')}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode REQ-, judul, barang, pemohon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl border border-border pl-9 pr-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-border px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED (Diajukan)</option>
            <option value="APPROVED">APPROVED (Disetujui)</option>
            <option value="IN_PROGRESS">IN_PROGRESS (Dikerjakan)</option>
            <option value="FULFILLED">FULFILLED (Terpenuhi)</option>
            <option value="CLOSED">CLOSED (Ditutup)</option>
            <option value="REJECTED">REJECTED (Ditolak)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs rounded-lg border border-border px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="URGENT">Mendesak (URGENT)</option>
            <option value="HIGH">Tinggi (HIGH)</option>
            <option value="MEDIUM">Sedang (MEDIUM)</option>
            <option value="LOW">Rendah (LOW)</option>
          </select>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-800 border border-border rounded-xl text-zinc-500 text-sm">
            <FileText className="w-10 h-10 mx-auto text-zinc-400 mb-2 stroke-[1.5]" />
            <div className="font-semibold text-zinc-700 dark:text-zinc-300">Tidak ada data kebutuhan</div>
            <p className="text-xs text-zinc-400 mt-1">Coba sesuaikan filter atau tambahkan kebutuhan baru.</p>
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
                className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-4"
              >
                {/* Header row: Code, Status, Priority, Requester */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-600">
                      {req.code}
                    </span>
                    <StatusBadge status={req.status} context="requisition" />
                    <StatusBadge status={req.priority} context="priority" />
                  </div>

                  <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Pemohon:</span>
                    <strong className="text-zinc-700 dark:text-zinc-200">{req.requester.fullName}</strong>
                  </div>
                </div>

                {/* Main Body */}
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {req.title}
                  </h2>
                  {req.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {req.description}
                    </p>
                  )}
                </div>

                {/* Division Routing */}
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-border">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> Dari:
                  </span>
                  <span className="bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-border text-zinc-800 dark:text-zinc-200">
                    {req.fromDivision.name} ({req.fromDivision.code})
                  </span>
                  <ArrowRight className="w-4 h-4 text-text-muted mx-1 flex-shrink-0" />
                  <span className="text-text-muted">Tujuan:</span>
                  <span className="bg-accent-subtle text-accent dark:text-[#FFC46B] border border-accent/25 px-2 py-0.5 rounded">
                    {req.toDivision.name} ({req.toDivision.code})
                  </span>
                </div>

                {/* Items preview */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-zinc-500">
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

                {/* Footer Toolbar: Detail view and action buttons separated without collision */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setSelectedReqForDetail(req)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg border border-border transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Lihat Detail & Riwayat ({req.events.length})</span>
                  </button>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {/* Submit (if DRAFT) */}
                    {req.status === 'DRAFT' && (isSourceDiv || isManagerOrOwner) && (
                      <button
                        onClick={() => handleTransition(req.id, 'SUBMITTED')}
                        disabled={isSubmitting}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
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
                          className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('requisition.approve')}</span>
                        </button>
                        <button
                          onClick={() => setRejectingReqId(req.id)}
                          disabled={isSubmitting}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
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
                        className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
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
                        className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
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
                        className="px-3.5 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
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

      {/* Requisition Detail & Audit History Modal */}
      {selectedReqForDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                    {selectedReqForDetail.code}
                  </span>
                  <StatusBadge status={selectedReqForDetail.status} context="requisition" />
                  <StatusBadge status={selectedReqForDetail.priority} context="priority" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {selectedReqForDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReqForDetail(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                ✕
              </button>
            </div>

            {selectedReqForDetail.description && (
              <div className="text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-border">
                {selectedReqForDetail.description}
              </div>
            )}

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Rincian Item Kebutuhan
              </h4>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-border text-zinc-500 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Nama Barang / Layanan</th>
                      <th className="px-4 py-2.5 text-center">Jumlah</th>
                      <th className="px-4 py-2.5">Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedReqForDetail.items.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-muted">
                        <td className="px-4 py-2.5 font-medium text-text">
                          {item.name}
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold text-accent dark:text-[#FFC46B]">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2.5 text-text-muted">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Trail & State Transitions Timeline */}
            <div>
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                Linimasa Transisi Status & Jejak Audit
              </h4>
              {selectedReqForDetail.events.length === 0 ? (
                <div className="text-xs text-text-subtle p-3 bg-surface-muted rounded-xl border border-border">
                  Belum ada catatan riwayat perubahan.
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {selectedReqForDetail.events.map((ev, idx) => (
                    <div key={ev.id || idx} className="flex items-start gap-3 relative pl-8">
                      <div className="w-7 h-7 rounded-full bg-surface border-2 border-accent flex items-center justify-center absolute left-0 top-0 text-accent dark:text-[#FFC46B] shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-surface-muted border border-border rounded-xl p-3 flex-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-text">
                            {ev.fromStatus ? `${ev.fromStatus} ➔ ` : ''}
                            <span className="text-accent dark:text-[#FFC46B]">{ev.toStatus}</span>
                          </span>
                          <span className="text-[11px] text-text-muted">
                            {new Date(ev.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                        {ev.reason && (
                          <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded text-rose-800 dark:text-rose-300">
                            <strong>Alasan:</strong> {ev.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedReqForDetail(null)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with >= 10 chars requirement */}
      {rejectingReqId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Tolak Pengajuan Kebutuhan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Sesuai aturan bisnis, penolakan kebutuhan wajib menyertakan alasan tertulis minimal 10
              karakter untuk akuntabilitas tim.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('requisition.rejectReasonPlaceholder')}
              rows={4}
              className="w-full text-xs rounded-xl border border-border p-3 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-2"
            />
            <div className="text-[11px] text-right text-zinc-400 mb-4">
              {rejectReason.trim().length} / 10 karakter minimum
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectingReqId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
              >
                {t('common.cancel')}
              </button>
              <button
                disabled={rejectReason.trim().length < 10 || isSubmitting}
                onClick={() => handleTransition(rejectingReqId, 'REJECTED', rejectReason)}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg shadow-sm"
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
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {t('requisition.createNew')}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

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
                  className="w-full text-xs rounded-xl border border-border p-2.5 bg-zinc-50 dark:bg-zinc-900"
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
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-zinc-50 dark:bg-zinc-900"
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
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-zinc-50 dark:bg-zinc-900"
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
                  className="w-full text-xs rounded-xl border border-border p-2.5 bg-zinc-50 dark:bg-zinc-900"
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
                  className="w-full text-xs rounded-xl border border-border p-2.5 bg-zinc-50 dark:bg-zinc-900"
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
                      setNewItems([...newItems, { name: '', quantity: 1, unit: 'unit' }])
                    }
                    className="text-xs font-semibold text-accent hover:text-accent-hover dark:text-[#FFC46B]"
                  >
                    + Tambah Item
                  </button>
                </div>

                <div className="space-y-2">
                  {newItems.map((itm, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Nama barang / jasa"
                        value={itm.name}
                        onChange={(e) => {
                          const copy = [...newItems];
                          copy[idx].name = e.target.value;
                          setNewItems(copy);
                        }}
                        className="flex-1 text-xs rounded-xl border border-border p-2 bg-surface text-text"
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
                        className="w-20 text-xs rounded-xl border border-border p-2 bg-surface text-text"
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
                        className="w-24 text-xs rounded-xl border border-border p-2 bg-surface text-text"
                      />
                      {newItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewItems(newItems.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 text-text-subtle hover:text-rose-600 rounded-lg hover:bg-surface-muted"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-text-muted hover:bg-surface-muted rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-accent hover:bg-accent-hover text-white rounded-xl shadow-sm transition-all hover:shadow-md hover:shadow-accent/20"
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
