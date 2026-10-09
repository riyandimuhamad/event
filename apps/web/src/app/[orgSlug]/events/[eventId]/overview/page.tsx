import React from 'react';
import Link from 'next/link';
import { getCurrentActor } from '@/lib/auth/session';
import { EventService } from '@/server/services/event.service';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Utensils,
  Wallet,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  PackageOpen,
  Sparkles,
  Check,
} from 'lucide-react';
import { t } from '@/lib/i18n';

interface OverviewPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function OverviewPage({ params }: OverviewPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const data = await EventService.getEventDashboard(actor, params.eventId);
  const { event, metrics, auditLogs } = data;

  const startsFormatted = new Date(event.startsAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const phases = [
    { key: 'PRE_EVENT', label: 'Pra-Event (Persiapan)', step: 1 },
    { key: 'DAY_OF', label: 'Hari H (Pelaksanaan)', step: 2 },
    { key: 'POST_EVENT', label: 'Pasca-Event (Benefit & Laporan)', step: 3 },
  ];

  const currentPhaseIndex = phases.findIndex((p) => p.key === event.currentPhase);

  // Overall event operational readiness score
  const readinessScore = Math.min(
    100,
    Math.round(
      ((metrics.totalMealsTarget > 0 ? metrics.mealPercentage : 50) +
        (metrics.totalVolunteers > 0 ? (metrics.checkedInVolunteers / metrics.totalVolunteers) * 100 : 50) +
        (metrics.openRequisitionsCount === 0 ? 100 : 70)) /
        3
    )
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Executive Banner & Phase Stepper */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40">
        {/* Ambient decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-violet-600/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 backdrop-blur-md">
                Fase: {t(`phases.${event.currentPhase}` as any, event.currentPhase)}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ● Status Event: {event.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {event.name}
            </h1>
            <p className="text-sm text-indigo-200/80 leading-relaxed max-w-xl">
              {event.description || 'Pusat komando operasional seluruh divisi dan relawan.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-indigo-200/90 font-medium">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <span>{startsFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{event.venueName || 'Venue Utama'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                <Users className="w-3.5 h-3.5 text-sky-300" />
                <span>Target: {event.expectedAttendees || 5000} Hadirin</span>
              </div>
            </div>
          </div>

          {/* Readiness dial widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex flex-col items-center justify-center min-w-[200px] text-center shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 mb-1">
              Kesiapan Operasional
            </span>
            <div className="text-4xl font-black text-white tabular-nums tracking-tight">
              {readinessScore}%
            </div>
            <span className="text-[11px] text-emerald-300 font-semibold mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Berjalan Normal
            </span>
          </div>
        </div>

        {/* Phase Stepper Timeline */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {phases.map((p, idx) => {
              const isPast = idx < currentPhaseIndex;
              const isCurrent = idx === currentPhaseIndex;
              return (
                <div
                  key={p.key}
                  className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-white/20 border-indigo-400 shadow-md text-white'
                      : isPast
                      ? 'bg-white/5 border-white/10 text-indigo-300/80'
                      : 'bg-white/5 border-white/10 text-white/50 opacity-70'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isCurrent
                        ? 'bg-indigo-500 text-white'
                        : isPast
                        ? 'bg-emerald-500/40 text-emerald-200'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 text-emerald-200" /> : p.step}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{p.label}</div>
                    <div className="text-[10px] text-indigo-200/70">
                      {isCurrent ? 'Fase Berjalan Saat Ini' : isPast ? 'Telah Selesai' : 'Akan Datang'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Quick Action Command Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/${params.orgSlug}/events/${params.eventId}/requisitions`}
          className="premium-card p-4 flex items-center justify-between group hover:border-indigo-500/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-text">Ajukan Kebutuhan</div>
              <div className="text-xs text-text-muted">Permintaan alat antar-divisi</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>

        <Link
          href={`/${params.orgSlug}/events/${params.eventId}/day-of`}
          className="premium-card p-4 flex items-center justify-between group hover:border-emerald-500/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-text">Presensi & Konsumsi</div>
              <div className="text-xs text-text-muted">Check-in QR & makan Hari H</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>

        <Link
          href={`/${params.orgSlug}/events/${params.eventId}/post-event`}
          className="premium-card p-4 flex items-center justify-between group hover:border-purple-500/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-text">Pencairan Benefit</div>
              <div className="text-xs text-text-muted">Fee & nomor sertifikat resmi</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>

      {/* 3. Four Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Phase Progress */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Fase Berjalan</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-text tracking-tight mb-1">
            {t(`phases.${event.currentPhase}` as any, event.currentPhase)}
          </div>
          <div className="w-full bg-surface-muted rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full w-2/5"></div>
          </div>
          <span className="text-[11px] text-text-muted mt-2 block">
            Tahap pra-acara dan alokasi logistik
          </span>
        </div>

        {/* Card 2: Open Requisitions */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Kebutuhan Terbuka</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-text tracking-tight tabular-nums mb-1">
            {metrics.openRequisitionsCount}{' '}
            <span className="text-xs font-medium text-text-muted">Item Kebutuhan</span>
          </div>
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>{metrics.urgentRequisitionsCount} Kebutuhan Mendesak (URGENT)</span>
          </div>
        </div>

        {/* Card 3: Volunteer Attendance */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Kehadiran Relawan</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-text tracking-tight tabular-nums mb-1">
            {metrics.checkedInVolunteers} / {metrics.totalVolunteers}
          </div>
          <div className="w-full bg-surface-muted rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics.attendancePercentage}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-text-muted mt-2 block tabular-nums">
            {metrics.attendancePercentage}% total relawan terdaftar telah check-in
          </span>
        </div>

        {/* Card 4: Meals Distributed */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pemberian Makan</span>
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-text tracking-tight tabular-nums mb-1">
            {metrics.totalMealsServed} / {metrics.totalMealsTarget}
          </div>
          <div className="w-full bg-surface-muted rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics.mealPercentage}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-text-muted mt-2 block tabular-nums">
            {metrics.mealPercentage}% jatah makan terpenuhi
          </span>
        </div>
      </div>

      {/* 4. Audit Log Stream */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                Jejak Audit Append-Only (Aktivitas Terkini)
              </h2>
              <p className="text-xs text-text-muted">
                Rekaman histori immutable sesuai aturan Bagian D
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            ✓ Tamper-proof
          </span>
        </div>

        <div className="divide-y divide-border">
          {auditLogs.map((log) => {
            const time = new Date(log.createdAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
            const date = new Date(log.createdAt).toLocaleDateString('id-ID');
            return (
              <div key={log.id.toString()} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-text bg-surface-muted px-2 py-0.5 rounded border border-border">
                      {log.action}
                    </span>
                    <span className="text-[11px] font-semibold text-text-muted">
                      Entitas: {log.entityType}
                    </span>
                  </div>
                  {log.after && (
                    <div className="text-xs text-text-muted font-mono bg-surface-muted/50 p-2 rounded-lg border border-border-subtle max-w-2xl overflow-x-auto">
                      {JSON.stringify(log.after)}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-text-muted flex-shrink-0">
                  <div className="font-bold text-text">{time} WIB</div>
                  <div className="text-[10px]">{date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
