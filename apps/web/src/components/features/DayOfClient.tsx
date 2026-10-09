'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Utensils,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  QrCode,
  Check,
  Search,
  Users,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface ConsumptionSlotData {
  id: string;
  kind: string;
  label: string;
  startsAt: string;
  endsAt: string;
  targetRecipients: number;
  servedCount: number;
  status: string;
}

interface RecipientData {
  id: string;
  code: string;
  fullName: string;
  type: string;
  hasCheckedIn: boolean;
  isServed: boolean;
}

interface DayOfClientProps {
  slots: ConsumptionSlotData[];
  initialRecipients: RecipientData[];
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

export function DayOfClient({
  slots: initialSlots,
  initialRecipients,
  actor,
  orgSlug,
  eventId,
}: DayOfClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'consumption' | 'checkin'>('consumption');
  const [slotsState, setSlotsState] = useState<ConsumptionSlotData[]>(initialSlots);
  const [selectedSlotId, setSelectedSlotId] = useState(initialSlots[0]?.id || '');
  const [recipientSearch, setRecipientSearch] = useState('');

  // Check-in state
  const [volunteerCodeInput, setVolunteerCodeInput] = useState('');
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    alreadyCheckedIn?: boolean;
    volunteerName?: string;
  } | null>(null);

  // Meal distribution state - synchronized across checkin
  const [recipients, setRecipients] = useState<RecipientData[]>(initialRecipients);
  const [distributionMessage, setDistributionMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Offline queue state
  const [offlineQueue, setOfflineQueue] = useState<Array<{
    clientOpId: string;
    type: string;
    payload: Record<string, unknown>;
  }>>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const activeSlot = slotsState.find((s) => s.id === selectedSlotId) || slotsState[0];

  // Filter recipients based on search
  const filteredRecipients = recipients.filter((r) => {
    if (!recipientSearch.trim()) return true;
    const q = recipientSearch.toLowerCase();
    return r.fullName.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
  });

  // Handle Check-In with reactive state synchronization
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = volunteerCodeInput.trim().toUpperCase();
    if (!code) return;

    setCheckInResult(null);
    const clientOpId = crypto.randomUUID();

    try {
      if (!navigator.onLine) {
        // Save to offline queue
        const op = {
          clientOpId,
          type: 'CHECK_IN',
          payload: { volunteerCode: code },
        };
        setOfflineQueue((prev) => [...prev, op]);
        // Update recipient locally
        setRecipients((prev) =>
          prev.map((r) => (r.code === code ? { ...r, hasCheckedIn: true } : r))
        );
        setCheckInResult({
          success: true,
          message: 'Offline: Presensi dicatat di antrean lokal perangkat.',
        });
        setVolunteerCodeInput('');
        return;
      }

      const res = await fetch(`/api/v1/volunteers/checkin?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerCode: code,
          clientOpId,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Check-in gagal');
      }

      // CRITICAL SYNC: Immediately update local recipients so meal button activates!
      setRecipients((prev) =>
        prev.map((r) => (r.code === code ? { ...r, hasCheckedIn: true } : r))
      );

      setCheckInResult({
        success: true,
        message: json.data.message,
        alreadyCheckedIn: json.data.alreadyCheckedIn,
        volunteerName: json.data.volunteer?.fullName,
      });
      setVolunteerCodeInput('');
      router.refresh();
    } catch (err: unknown) {
      setCheckInResult({
        success: false,
        message: (err as Error).message,
      });
    }
  };

  // Handle Meal Distribution with reactive slot counter increment
  const handleDistributeMeal = async (recipient: RecipientData) => {
    if (!activeSlot) return;
    setDistributionMessage(null);

    const clientOpId = crypto.randomUUID();

    try {
      if (!navigator.onLine) {
        // Save to offline queue
        const op = {
          clientOpId,
          type: 'CONSUMPTION_DISTRIBUTION',
          payload: {
            slotId: activeSlot.id,
            recipientType: recipient.type,
            recipientId: recipient.id,
            quantity: 1,
          },
        };
        setOfflineQueue((prev) => [...prev, op]);
        setRecipients((prev) =>
          prev.map((r) => (r.id === recipient.id ? { ...r, isServed: true } : r))
        );
        // Increment slot counter in local state
        setSlotsState((prev) =>
          prev.map((s) => (s.id === activeSlot.id ? { ...s, servedCount: s.servedCount + 1 } : s))
        );
        setDistributionMessage({
          text: `Offline: Konsumsi untuk ${recipient.fullName} dicatat secara lokal.`,
          isError: false,
        });
        return;
      }

      const res = await fetch(
        `/api/v1/consumption/distributions?orgSlug=${orgSlug}&eventId=${eventId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slotId: activeSlot.id,
            recipientType: recipient.type,
            recipientId: recipient.id,
            quantity: 1,
            clientOpId,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Gagal memberikan konsumsi');
      }

      // Mark served in local recipient state
      setRecipients((prev) =>
        prev.map((r) => (r.id === recipient.id ? { ...r, isServed: true } : r))
      );

      // Increment slot counter in local state
      setSlotsState((prev) =>
        prev.map((s) =>
          s.id === activeSlot.id ? { ...s, servedCount: json.data.servedCount || s.servedCount + 1 } : s
        )
      );

      setDistributionMessage({
        text: `Sukses: Makanan berhasil diberikan kepada ${recipient.fullName} (${recipient.code})`,
        isError: false,
      });
      router.refresh();
    } catch (err: unknown) {
      setDistributionMessage({
        text: (err as Error).message,
        isError: true,
      });
    }
  };

  // Handle Offline Sync
  const handleSyncOffline = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);

    try {
      const operationsToSend = offlineQueue.map((op) => ({
        ...op,
        clientTimestamp: new Date().toISOString(),
      }));

      const res = await fetch(`/api/v1/sync?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations: operationsToSend }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Gagal sinkronisasi');
      }

      setOfflineQueue([]);
      alert(`Sinkronisasi selesai! ${json.data.totalProcessed} operasi berhasil disinkronkan ke server.`);
      router.refresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  const servedPercentage = activeSlot
    ? Math.min(100, Math.round((activeSlot.servedCount / activeSlot.targetRecipients) * 100))
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Sync indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            {t('dayOf.title')}
          </h1>
          <p className="text-text-muted text-xs sm:text-sm mt-0.5">{t('dayOf.subtitle')}</p>
        </div>

        {offlineQueue.length > 0 && (
          <button
            onClick={handleSyncOffline}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all animate-bounce"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sinkronkan {offlineQueue.length} Antrean Offline</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('consumption')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'consumption'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>{t('dayOf.mealDistribution')}</span>
        </button>
        <button
          onClick={() => setActiveTab('checkin')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'checkin'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t('dayOf.checkInStation')}</span>
        </button>
      </div>

      {/* Tab 1: Meal Distribution */}
      {activeTab === 'consumption' && (
        <div className="space-y-6">
          {/* Slot selector cards - clean responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slotsState.map((s) => {
              const isSelected = s.id === selectedSlotId;
              const slotPercent = Math.min(
                100,
                Math.round((s.servedCount / s.targetRecipients) * 100)
              );
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlotId(s.id)}
                  type="button"
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-accent-subtle border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                      : 'premium-card hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-muted text-text-muted">
                      {s.kind}
                    </span>
                    <span className="text-xs font-bold text-text tabular-nums">
                      {s.servedCount} / {s.targetRecipients}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-text truncate">{s.label}</div>
                  <div className="w-full bg-surface-muted rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${slotPercent}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Slot Summary Card */}
          {activeSlot && (
            <div className="premium-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-text">{activeSlot.label}</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                      Slot Aktif
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Aturan B6: Makanan hanya boleh diberikan pada relawan yang telah check-in hari ini.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-black text-text tabular-nums">
                    {activeSlot.servedCount}{' '}
                    <span className="text-sm font-semibold text-text-muted">
                      / {activeSlot.targetRecipients} Porsi
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {servedPercentage}% Terlayani
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-muted rounded-full h-3 mt-4 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-teal-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${servedPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Realtime Alert Banner */}
          {distributionMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in ${
                distributionMessage.isError
                  ? 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200'
              }`}
            >
              {distributionMessage.isError ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <Check className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{distributionMessage.text}</span>
            </div>
          )}

          {/* Search & Recipients Table */}
          <div className="premium-card overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="font-bold text-sm text-text">
                Daftar Relawan & Hak Konsumsi ({filteredRecipients.length} Orang)
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama atau kode..."
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border pl-8 pr-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {filteredRecipients.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-surface-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-surface-muted px-2.5 py-1 rounded-lg border border-border tabular-nums text-text">
                      {rec.code}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-text">{rec.fullName}</div>
                      <div className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                        {rec.hasCheckedIn ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Sudah Check-in (Berhak)
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                            Belum Check-in (Terkunci)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {rec.isServed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4" /> Sudah Diberikan
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDistributeMeal(rec)}
                        disabled={!rec.hasCheckedIn}
                        type="button"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
                      >
                        {t('dayOf.giveMeal')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Check-In Station */}
      {activeTab === 'checkin' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="premium-card p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white mx-auto flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20">
                <QrCode className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-text">Stasiun Presensi Check-in</h2>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                Scan barcode/QR atau ketik kode relawan resmi (misal: <code>VOL-0001</code>) untuk
                memvalidasi kehadiran dan membuka jatah konsumsi.
              </p>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Ketik kode: VOL-0001"
                  value={volunteerCodeInput}
                  onChange={(e) => setVolunteerCodeInput(e.target.value.toUpperCase())}
                  className="w-full text-center text-xl font-mono font-black tracking-widest rounded-2xl border border-border p-4 bg-surface focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                Konfirmasi Check-in Lapangan
              </button>
            </form>

            {checkInResult && (
              <div
                className={`mt-5 p-4 rounded-2xl text-sm border animate-fade-in ${
                  checkInResult.success
                    ? checkInResult.alreadyCheckedIn
                      ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  {checkInResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span>{checkInResult.message}</span>
                </div>
                {checkInResult.volunteerName && (
                  <div className="text-xs mt-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                    Relawan Terverifikasi: {checkInResult.volunteerName}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
