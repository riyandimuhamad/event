import React from 'react';
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
  AlertCircle,
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

  return (
    <div className="space-y-6">
      {/* Event Header Banner */}
      <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                Fase: {t(`phases.${event.currentPhase}` as any, event.currentPhase)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                {event.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{event.name}</h1>
            <p className="text-zinc-500 text-sm mt-1">{event.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-700/50 px-3 py-2 rounded-lg border border-border">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{startsFormatted}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-700/50 px-3 py-2 rounded-lg border border-border">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="truncate max-w-[200px]">{event.venueName || 'Venue Belum Ditentukan'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Top Metric Cards per design.md Section 4.3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Progres Fase & Waktu */}
        <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Status Fase</span>
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
            {t(`phases.${event.currentPhase}` as any, event.currentPhase)}
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-2 rounded-full w-1/3"></div>
          </div>
          <span className="text-xs text-zinc-500 mt-2 block">Menuju Fase Hari H Pelaksanaan</span>
        </div>

        {/* Card 2: Kebutuhan Terbuka */}
        <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kebutuhan Terbuka</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums mb-1">
            {metrics.openRequisitionsCount} <span className="text-sm font-normal text-zinc-500">Kebutuhan</span>
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-3 flex items-center gap-1">
            <span>{metrics.urgentRequisitionsCount} prioritas Mendesak (URGENT)</span>
          </div>
        </div>

        {/* Card 3: Kehadiran Relawan */}
        <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kehadiran Relawan</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums mb-1">
            {metrics.checkedInVolunteers} / {metrics.totalVolunteers}
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${metrics.attendancePercentage}%` }}
            ></div>
          </div>
          <span className="text-xs text-zinc-500 mt-2 block tabular-nums">
            {metrics.attendancePercentage}% telah check-in hari ini
          </span>
        </div>

        {/* Card 4: Konsumsi & Benefit */}
        <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Konsumsi Terdistribusi</span>
            <Utensils className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums mb-1">
            {metrics.totalMealsServed} / {metrics.totalMealsTarget}
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-sky-500 h-2 rounded-full"
              style={{ width: `${metrics.mealPercentage}%` }}
            ></div>
          </div>
          <span className="text-xs text-zinc-500 mt-2 block tabular-nums">
            {metrics.mealPercentage}% kuota makanan terlayani
          </span>
        </div>
      </div>

      {/* Activity Log Section */}
      <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              10 Aktivitas Terbaru (Jejak Audit Append-Only)
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Auto-recorded</span>
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
              <div key={log.id.toString()} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 font-mono">
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                      {log.entityType}
                    </span>
                  </div>
                  {log.after && (
                    <p className="text-xs text-zinc-500 mt-1 font-mono truncate max-w-xl">
                      Perubahan: {JSON.stringify(log.after)}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-zinc-400 whitespace-nowrap">
                  <div>{time} WIB</div>
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
