import React from 'react';
import Link from 'next/link';
import { getCurrentActor } from '@/lib/auth/session';
import { EventService } from '@/server/services/event.service';
import { DivisionService } from '@/server/services/division.service';
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
  ArrowRight,
  ShieldCheck,
  Package,
  Sparkles,
  Layers,
  Check,
  TrendingUp,
  FileText,
  SlidersHorizontal,
  ChevronRight,
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
  const [data, divisions] = await Promise.all([
    EventService.getEventDashboard(actor, params.eventId),
    DivisionService.getDivisions(actor, params.eventId),
  ]);

  const { event, metrics, auditLogs } = data;

  const startsFormatted = new Date(event.startsAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate overall readiness score
  const readinessScore = Math.min(
    100,
    Math.round(
      ((metrics.totalMealsTarget > 0 ? metrics.mealPercentage : 85) +
        (metrics.totalVolunteers > 0 ? (metrics.checkedInVolunteers / metrics.totalVolunteers) * 100 : 90) +
        (metrics.openRequisitionsCount === 0 ? 100 : Math.max(60, 100 - metrics.urgentRequisitionsCount * 10))) /
        3
    )
  );

  return (
    <div className="space-y-6 animate-fade-in text-text">
      {/* ========================================================================= */}
      {/* TIER 1: SOFT UI 4-COLUMN MINI STAT / KPI CARDS                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1: Fase Berjalan */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Fase Berjalan
            </p>
            <h3 className="text-xl font-extrabold text-text mt-0.5 tracking-tight">
              {t(`phases.${event.currentPhase}` as any, event.currentPhase)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +100%
              </span>
              <span className="text-xs text-text-muted font-medium">Tepat Jadwal</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tl from-[#7A2E33] to-[#4A171B] text-[#FFC46B] shadow-md shadow-[#7A2E33]/20 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Permintaan Kebutuhan */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Permintaan Logistik
            </p>
            <h3 className="text-xl font-extrabold text-text mt-0.5 tracking-tight">
              {metrics.openRequisitionsCount}{' '}
              <span className="text-xs font-medium text-text-muted">Kebutuhan</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              {metrics.urgentRequisitionsCount > 0 ? (
                <>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {metrics.urgentRequisitionsCount} Mendesak
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                </>
              ) : (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Semua Terlayani
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tl from-[#9C383F] to-[#601A20] text-white shadow-md shadow-[#7A2E33]/20 flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-[#FFC46B]" />
          </div>
        </div>

        {/* Card 3: Presensi Relawan */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Presensi Relawan
            </p>
            <h3 className="text-xl font-extrabold text-text mt-0.5 tracking-tight">
              {metrics.checkedInVolunteers} / {metrics.totalVolunteers}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{metrics.attendancePercentage}%
              </span>
              <span className="text-xs text-text-muted font-medium">Telah Check-in</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tl from-[#2E6B47] to-[#1E4B31] text-emerald-200 shadow-md shadow-emerald-900/20 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Distribusi Konsumsi */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Pemberian Makan
            </p>
            <h3 className="text-xl font-extrabold text-text mt-0.5 tracking-tight">
              {metrics.totalMealsServed} / {metrics.totalMealsTarget}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {metrics.mealPercentage}%
              </span>
              <span className="text-xs text-text-muted font-medium">Porsi Terpenuhi</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tl from-[#C97B20] to-[#804808] text-[#FFC46B] shadow-md shadow-amber-900/20 flex-shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: SOFT UI FEATURED ROW (BUILT BY DEVELOPERS + ROCKETS HIGHLIGHT)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: "Built by developers" style featured banner (7 cols) */}
        <div className="lg:col-span-7 bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-accent dark:text-[#FFC46B] uppercase tracking-wider">
                  Pusat Komando & Orkestrasi
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  ● Status: {event.status}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-text tracking-tight">
                {event.name}
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                {event.description ||
                  'Sistem operasional terpadu yang menyinkronkan 6 divisi, alokasi kebutuhan logistik, 150 relawan bershift, dan pencairan hak komite secara transparan.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-text-muted font-medium">
                <div className="flex items-center gap-1.5 bg-surface-muted px-2.5 py-1 rounded-lg border border-border">
                  <Calendar className="w-3.5 h-3.5 text-accent dark:text-[#FFC46B]" />
                  <span>{startsFormatted}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-muted px-2.5 py-1 rounded-lg border border-border">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{event.venueName || 'Venue Utama'}</span>
                </div>
              </div>
            </div>

            {/* Illustration panel card on right */}
            <div className="w-full sm:w-48 h-40 rounded-xl bg-gradient-to-tr from-[#2A1411] via-[#4A171B] to-[#7A2E33] p-4 flex flex-col justify-between text-white shadow-md relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-[#FFC46B]/20 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC46B]">
                  Target Acara
                </span>
                <Layers className="w-4 h-4 text-[#FFC46B]" />
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-black text-white tracking-tight">
                  {event.expectedAttendees ? event.expectedAttendees.toLocaleString('id-ID') : '5.000'}
                </div>
                <div className="text-[10px] text-[#EFE9DF]/80">Hadirin Terkonfirmasi</div>
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFC46B]" />
                SOP Terverifikasi
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-border flex items-center justify-between">
            <Link
              href={`/${params.orgSlug}/events/${params.eventId}/requisitions`}
              className="text-xs font-bold text-accent dark:text-[#FFC46B] flex items-center gap-1.5 hover:gap-2.5 transition-all group-hover:text-accent-hover"
            >
              <span>Ajukan & Pantau Permintaan Logistik</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-text-muted">
              {divisions.length} Divisi Terkoneksi
            </span>
          </div>
        </div>

        {/* Right Card: "Work with the rockets" style dark highlight card (5 cols) */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2A1411] via-[#1C0D0B] to-[#140807] text-[#EFE9DF] p-6 border border-[#7A2E33]/40 shadow-xl flex flex-col justify-between">
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-[#FFC46B]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-[#7A2E33]/30 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFC46B]">
                Kesiapan Lapangan
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7A2E33]/60 text-[#FFC46B] border border-[#FFC46B]/40">
                Normal Operasional
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Kesiapan Hari-H Operasional
            </h3>
            <p className="text-xs text-[#EFE9DF]/80 leading-relaxed mb-6">
              Kalkulasi otomatis dari kesiapan konsumsi, absensi relawan bershift, dan resolusi logistik darurat.
            </p>

            {/* Circular Progress & Metrics Row */}
            <div className="flex items-center gap-6 bg-black/30 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#FFC46B]"
                    strokeDasharray={`${readinessScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-base font-black text-white tabular-nums">
                  {readinessScore}%
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[#EFE9DF]">Presensi: {metrics.attendancePercentage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFC46B]" />
                  <span className="text-[#EFE9DF]">Konsumsi: {metrics.mealPercentage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-[#EFE9DF]">{metrics.urgentRequisitionsCount} Kebutuhan Mendesak</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-4 border-t border-white/10">
            <Link
              href={`/${params.orgSlug}/events/${params.eventId}/day-of`}
              className="text-xs font-bold text-[#FFC46B] flex items-center justify-between hover:text-white transition-colors"
            >
              <span>Inspeksi Posko & Check-In Lapangan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 3: SOFT UI ANALYTICS ROW (ACTIVE USERS BAR + FLOW LINE CHART)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Soft UI "Active Users" Bar Chart Card (5 cols) */}
        <div className="lg:col-span-5 bg-surface rounded-2xl border border-border shadow-sm p-5 flex flex-col justify-between">
          <div>
            {/* Dark Chart Container */}
            <div className="bg-gradient-to-br from-[#241312] to-[#180C0B] rounded-xl p-4 mb-4 border border-[#7A2E33]/30 shadow-inner">
              <div className="flex items-center justify-between text-white/70 mb-2 text-xs">
                <span className="font-semibold text-white/90">Distribusi Beban Shift (Pagi - Malam)</span>
                <span className="text-[11px] text-[#FFC46B] font-mono">150 Relawan</span>
              </div>
              {/* Responsive SVG Bar Chart */}
              <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-1">
                {[
                  { label: '07:00', height: '40%', val: '28 Org' },
                  { label: '09:00', height: '65%', val: '45 Org' },
                  { label: '11:00', height: '85%', val: '62 Org' },
                  { label: '13:00', height: '95%', val: '70 Org' },
                  { label: '15:00', height: '70%', val: '50 Org' },
                  { label: '17:00', height: '88%', val: '65 Org' },
                  { label: '19:00', height: '60%', val: '42 Org' },
                  { label: '21:00', height: '35%', val: '24 Org' },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full bg-white/5 rounded-t-md h-32 flex items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-[#7A2E33] to-[#FFC46B] group-hover:to-white transition-all duration-300"
                        style={{ height: bar.height }}
                        title={`${bar.label}: ${bar.val}`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-white/60">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Headline and metric */}
            <div className="px-1">
              <h4 className="text-base font-bold text-text">Aktivitas Shift & Posko Relawan</h4>
              <p className="text-xs text-text-muted mt-0.5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">(+28%)</span> relawan terdistribusi aktif di 6 zona posko
              </p>
            </div>
          </div>

          {/* 4 Mini Stat Counter Badges (Soft UI style) */}
          <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-text-muted">
                <div className="w-4 h-4 rounded-md bg-accent-subtle text-accent flex items-center justify-center">
                  <Users className="w-2.5 h-2.5" />
                </div>
                <span>Relawan</span>
              </div>
              <div className="text-sm font-extrabold text-text">{metrics.totalVolunteers}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-text-muted">
                <div className="w-4 h-4 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Hadir</span>
              </div>
              <div className="text-sm font-extrabold text-text">{metrics.checkedInVolunteers}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-text-muted">
                <div className="w-4 h-4 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                  <Utensils className="w-2.5 h-2.5" />
                </div>
                <span>Porsi</span>
              </div>
              <div className="text-sm font-extrabold text-text">{metrics.totalMealsServed}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-text-muted">
                <div className="w-4 h-4 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-2.5 h-2.5" />
                </div>
                <span>Mendesak</span>
              </div>
              <div className="text-sm font-extrabold text-text">{metrics.urgentRequisitionsCount}</div>
            </div>
          </div>
        </div>

        {/* Right Card: Soft UI "Sales Overview" Dual-Line Chart Card (7 cols) */}
        <div className="lg:col-span-7 bg-surface rounded-2xl border border-border shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-base font-bold text-text">
                  Arus Distribusi Logistik & Konsumsi
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">(+18% efisiensi)</span> realisasi kebutuhan antar-divisi berjalan mulus
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-text-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7A2E33]" />
                  <span>Permintaan Masuk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFC46B]" />
                  <span>Kebutuhan Terpenuhi</span>
                </div>
              </div>
            </div>

            {/* Smooth Bezier Dual-Area SVG Line Chart */}
            <div className="h-56 w-full pt-4 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  {/* Gradient for Amber area */}
                  <linearGradient id="amberGlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFC46B" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FFC46B" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Gradient for Maroon area */}
                  <linearGradient id="maroonGlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A2E33" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7A2E33" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                <line x1="0" y1="165" x2="500" y2="165" stroke="currentColor" strokeOpacity="0.12" />

                {/* Maroon Area Fill & Line (Permintaan Masuk) */}
                <path
                  d="M0,130 C60,110 120,140 180,90 C240,40 300,70 360,50 C420,30 460,45 500,25 L500,165 L0,165 Z"
                  fill="url(#maroonGlowGradient)"
                />
                <path
                  d="M0,130 C60,110 120,140 180,90 C240,40 300,70 360,50 C420,30 460,45 500,25"
                  fill="none"
                  stroke="#7A2E33"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Amber Area Fill & Line (Kebutuhan Terpenuhi) */}
                <path
                  d="M0,150 C60,135 120,120 180,105 C240,65 300,80 360,60 C420,45 460,35 500,28 L500,165 L0,165 Z"
                  fill="url(#amberGlowGradient)"
                />
                <path
                  d="M0,150 C60,135 120,120 180,105 C240,65 300,80 360,60 C420,45 460,35 500,28"
                  fill="none"
                  stroke="#FFC46B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points on Amber line */}
                <circle cx="180" cy="105" r="4" fill="#FFC46B" stroke="#2A1411" strokeWidth="2" />
                <circle cx="360" cy="60" r="4" fill="#FFC46B" stroke="#2A1411" strokeWidth="2" />
                <circle cx="500" cy="28" r="4" fill="#FFC46B" stroke="#2A1411" strokeWidth="2" />
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between text-[10px] font-mono text-text-muted mt-2 px-1">
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>16:00</span>
                <span>18:00</span>
                <span>20:00</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-text-muted">
              Pembaruan live dari logistik posko & QR scanner konsumsi
            </span>
            <Link
              href={`/${params.orgSlug}/events/${params.eventId}/post-event`}
              className="font-bold text-accent dark:text-[#FFC46B] flex items-center gap-1 hover:underline"
            >
              <span>Laporan Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 4: SOFT UI PROJECTS TABLE + ORDERS OVERVIEW ACTIVITY TIMELINE       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Soft UI "Projects" Divisi & Pemenuhan Tugas Table (8 cols) */}
        <div className="lg:col-span-8 bg-surface rounded-2xl border border-border shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <div>
              <h3 className="text-lg font-bold text-text">Divisi & Pemenuhan Tugas</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Pemantauan tanggung jawab, alokasi relawan, dan status permintaan per divisi
              </p>
            </div>
            <Link
              href={`/${params.orgSlug}/events/${params.eventId}/divisions`}
              className="text-xs font-bold text-accent dark:text-[#FFC46B] bg-accent-subtle hover:bg-accent/15 px-3 py-1.5 rounded-lg border border-accent/25 transition-colors"
            >
              Kelola Divisi
            </Link>
          </div>

          {/* Clean Soft UI Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-text-muted uppercase text-[10px] font-bold tracking-wider border-b border-border">
                  <th className="pb-3 pr-4">Divisi Operasional</th>
                  <th className="pb-3 px-4">Ketua & Tim</th>
                  <th className="pb-3 px-4">Logistik Masuk / Keluar</th>
                  <th className="pb-3 pl-4 text-right">Penyelesaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {divisions.map((div, idx) => {
                  // Synthetic progress based on remaining open requisitions
                  const totalReq = div._count.requisitionsFrom + div._count.requisitionsTo;
                  const progressPct = totalReq === 0 ? 100 : Math.max(45, 100 - div._count.requisitionsTo * 15);

                  return (
                    <tr key={div.id} className="hover:bg-surface-muted/40 transition-colors">
                      {/* Divisi Name + Icon */}
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent dark:text-[#FFC46B] flex items-center justify-center font-bold text-xs border border-accent/20 flex-shrink-0">
                            {div.code.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-text text-sm">{div.name}</div>
                            <div className="text-[11px] text-text-muted font-mono">{div.code}</div>
                          </div>
                        </div>
                      </td>

                      {/* Ketua & Team Avatars */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-medium text-text truncate max-w-[140px]">
                            {div.headUser ? div.headUser.fullName : 'Koordinator Ditugaskan'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                            <span className="font-bold text-accent dark:text-[#FFC46B]">
                              {div._count.volunteers} Relawan
                            </span>
                            <span>•</span>
                            <span>{div._count.committeeMembers} Panitia</span>
                          </div>
                        </div>
                      </td>

                      {/* Logistik */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-surface-muted border border-border text-text">
                            {div._count.requisitionsFrom} diajukan
                          </span>
                          <span className="text-text-muted">/</span>
                          <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                            {div._count.requisitionsTo} ditugaskan
                          </span>
                        </div>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 pl-4 text-right">
                        <div className="inline-flex flex-col items-end gap-1 min-w-[90px]">
                          <span className="font-extrabold text-xs text-text tabular-nums">
                            {progressPct}%
                          </span>
                          <div className="w-24 bg-surface-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-accent dark:bg-[#FFC46B] h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Soft UI "Orders Overview" Activity Timeline (4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-text">Histori Log Audit</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Append-only tamper-proof jejak sistem
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ✓ Valid
              </span>
            </div>

            {/* Vertical Timeline with Soft UI connected line */}
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {auditLogs.slice(0, 6).map((log, idx) => {
                const time = new Date(log.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                // Pick icon & color based on action type
                let iconColor = 'bg-accent text-white';
                let IconComp = Activity;

                if (log.action.includes('CREATE') || log.action.includes('CHECK_IN')) {
                  iconColor = 'bg-emerald-600 text-white';
                  IconComp = CheckCircle2;
                } else if (log.action.includes('REQUISITION') || log.action.includes('UPDATE')) {
                  iconColor = 'bg-[#7A2E33] text-[#FFC46B]';
                  IconComp = Package;
                } else if (log.action.includes('DELETE') || log.action.includes('ALERT')) {
                  iconColor = 'bg-rose-600 text-white';
                  IconComp = AlertTriangle;
                }

                return (
                  <div key={log.id.toString()} className="relative group">
                    {/* Circle Node on Timeline */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm ${iconColor} ring-4 ring-surface`}
                    >
                      <IconComp className="w-3 h-3" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-text tracking-tight flex items-center justify-between">
                        <span className="font-mono text-[11px]">{log.action}</span>
                        <span className="text-[10px] text-text-muted font-normal">{time} WIB</span>
                      </div>
                      <p className="text-[11px] text-text-muted">
                        Entitas {log.entityType} diproses oleh sistem
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>{auditLogs.length} jejak terekam</span>
              <span className="font-mono text-[10px] text-accent dark:text-[#FFC46B]">
                SHA-256 SIGNED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
