import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { prisma } from '@eventops/db';
import { Music2, Clock, FileCheck } from 'lucide-react';
import { t } from '@/lib/i18n';

interface TalentsPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function TalentsPage({ params }: TalentsPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const talents = await prisma.talent.findMany({
    where: { eventId: params.eventId },
    include: {
      shows: { orderBy: { startsAt: 'asc' } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('nav.talents')}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Pengisi acara, jadwal pertunjukan (showtime), dan rider teknis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {talents.map((tlt) => (
          <div
            key={tlt.id}
            className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                  {tlt.category}
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {tlt.name}
                </h2>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Manajemen: {tlt.managementName} ({tlt.managementContact})
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <Music2 className="w-4 h-4" />
              </div>
            </div>

            {tlt.riderNotes && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-700/40 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 border border-border">
                <span className="font-semibold block text-zinc-700 dark:text-zinc-200 mb-0.5">
                  Catatan Rider Teknis:
                </span>
                {tlt.riderNotes}
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <span className="text-xs font-bold text-zinc-500 block mb-2">Jadwal Tampil:</span>
              {tlt.shows.length > 0 ? (
                tlt.shows.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-xs p-2 rounded bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100"
                  >
                    <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                      {s.stageName}
                    </span>
                    <span className="text-zinc-500">
                      {new Date(s.startsAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(s.endsAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      WIB
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-zinc-400 italic">Belum ada jadwal panggung</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
