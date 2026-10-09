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
            className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-subtle text-accent dark:text-[#FFC46B] border border-accent/25">
                  {tlt.category}
                </span>
                <h2 className="text-lg font-bold text-text mt-1">
                  {tlt.name}
                </h2>
                <div className="text-xs text-text-muted mt-0.5">
                  Manajemen: {tlt.managementName} ({tlt.managementContact})
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent dark:text-[#FFC46B] border border-accent/20 flex items-center justify-center">
                <Music2 className="w-4 h-4" />
              </div>
            </div>

            {tlt.riderNotes && (
              <div className="p-3 bg-surface-muted rounded-xl text-xs text-text-muted border border-border">
                <span className="font-semibold block text-text mb-0.5">
                  Catatan Rider Teknis:
                </span>
                {tlt.riderNotes}
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <span className="text-xs font-bold text-text-muted block mb-2">Jadwal Tampil:</span>
              {tlt.shows.length > 0 ? (
                tlt.shows.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-accent-subtle/50 border border-accent/20"
                  >
                    <span className="font-semibold text-accent dark:text-[#FFC46B]">
                      {s.stageName}
                    </span>
                    <span className="text-text-muted font-mono">
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
