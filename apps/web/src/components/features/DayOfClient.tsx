'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Utensils,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  QrCode,
  Check,
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
  slots,
  initialRecipients,
  actor,
  orgSlug,
  eventId,
}: DayOfClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'consumption' | 'checkin'>('consumption');
  const [selectedSlotId, setSelectedSlotId] = useState(slots[0]?.id || '');

  // Check-in state
  const [volunteerCodeInput, setVolunteerCodeInput] = useState('');
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    alreadyCheckedIn?: boolean;
    volunteerName?: string;
  } | null>(null);

  // Meal distribution state
  const [recipients, setRecipients] = useState(initialRecipients);
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

  const activeSlot = slots.find((s) => s.id === selectedSlotId);

  // Handle Check-In
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerCodeInput.trim()) return;

    setCheckInResult(null);
    const clientOpId = crypto.randomUUID();

    try {
      if (!navigator.onLine) {
        // Save to offline queue per rules.md Section E
        const op = {
          clientOpId,
          type: 'CHECK_IN',
          payload: { volunteerCode: volunteerCodeInput.trim() },
        };
        setOfflineQueue((prev) => [...prev, op]);
        setCheckInResult({
          success: true,
          message: 'Offline: Disimpan di antrean perangkat lokal.',
        });
        setVolunteerCodeInput('');
        return;
      }

      const res = await fetch(`/api/v1/volunteers/checkin?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerCode: volunteerCodeInput.trim(),
          clientOpId,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Check-in gagal');
      }

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

  // Handle Meal Distribution
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

      // Mark served locally
      setRecipients((prev) =>
        prev.map((r) => (r.id === recipient.id ? { ...r, isServed: true } : r))
      );
      setDistributionMessage({
        text: `Sukses: Makanan berhasil diberikan kepada ${recipient.fullName}`,
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
      alert(`Sinkronisasi selesai! ${json.data.totalProcessed} operasi berhasil dikirim.`);
      router.refresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Sync indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('dayOf.title')}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{t('dayOf.subtitle')}</p>
        </div>

        {/* Sync queue button if any */}
        {offlineQueue.length > 0 && (
          <button
            onClick={handleSyncOffline}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors animate-pulse"
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
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'consumption'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>{t('dayOf.mealDistribution')}</span>
        </button>
        <button
          onClick={() => setActiveTab('checkin')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'checkin'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t('dayOf.checkInStation')}</span>
        </button>
      </div>

      {/* Tab 1: Meal Distribution */}
      {activeTab === 'consumption' && (
        <div className="space-y-6">
          {/* Slot selector buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {slots.map((s) => {
              const isSelected = s.id === selectedSlotId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlotId(s.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-zinc-800 border-border text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {s.kind}
                  </div>
                  <div className="font-bold text-sm truncate">{s.label}</div>
                  <div className="text-xs text-zinc-500 mt-1 tabular-nums">
                    {s.servedCount} / {s.targetRecipients} porsi
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active slot summary banner */}
          {activeSlot && (
            <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {activeSlot.label}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Hanya penerima yang telah check-in hari ini yang berhak menerima konsumsi.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {activeSlot.servedCount} / {activeSlot.targetRecipients}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium">Terlayani dari Target</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2.5 mt-4 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((activeSlot.servedCount / activeSlot.targetRecipients) * 100)
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {distributionMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                distributionMessage.isError
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
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

          {/* Checked-in recipients list */}
          <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Daftar Relawan & Status Konsumsi
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {recipients.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-700/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded tabular-nums">
                      {rec.code}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {rec.fullName}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {rec.hasCheckedIn ? (
                          <span className="text-emerald-600 font-medium">✓ Sudah Check-in</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Belum Check-in</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {rec.isServed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Sudah Diberikan
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDistributeMeal(rec)}
                        disabled={!rec.hasCheckedIn}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
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
          <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 mx-auto flex items-center justify-center mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Stasiun Presensi Check-in
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Masukkan kode QR volunteer (misal: <code>VOL-0001</code>) untuk check-in.
              </p>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Ketik kode misal: VOL-0001"
                  value={volunteerCodeInput}
                  onChange={(e) => setVolunteerCodeInput(e.target.value.toUpperCase())}
                  className="w-full text-center text-lg font-mono font-bold tracking-wider rounded-xl border border-border p-3.5 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors"
              >
                Konfirmasi Check-in
              </button>
            </form>

            {checkInResult && (
              <div
                className={`mt-4 p-4 rounded-xl text-sm ${
                  checkInResult.success
                    ? checkInResult.alreadyCheckedIn
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
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
                  <div className="text-xs mt-1 font-medium">
                    Relawan: {checkInResult.volunteerName}
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
