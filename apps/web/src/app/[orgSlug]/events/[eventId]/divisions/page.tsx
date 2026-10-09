import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { DivisionService } from '@/server/services/division.service';
import { Users2, Shield, HeartHandshake, GitPullRequestDraft } from 'lucide-react';
import { t } from '@/lib/i18n';

interface DivisionsPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function DivisionsPage({ params }: DivisionsPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const divisions = await DivisionService.getDivisions(actor, params.eventId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('nav.divisions')}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Unit kerja operasional dalam pelaksanaan event
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {divisions.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm space-y-4 hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded border border-indigo-200">
                  {d.code}
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                  {d.name}
                </h2>
              </div>
            </div>

            <p className="text-xs text-zinc-500 line-clamp-2">{d.description || 'Tidak ada deskripsi.'}</p>

            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  Kepala Divisi:
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {d.headUser?.fullName || 'Belum Ditunjuk'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Users2 className="w-3.5 h-3.5 text-zinc-400" />
                  Panitia Resmi:
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {d._count.committeeMembers} orang
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-zinc-400" />
                  Relawan (Volunteer):
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {d._count.volunteers} orang
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <GitPullRequestDraft className="w-3.5 h-3.5 text-zinc-400" />
                  Kebutuhan Aktif:
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {d._count.requisitionsFrom + d._count.requisitionsTo} aktif
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
