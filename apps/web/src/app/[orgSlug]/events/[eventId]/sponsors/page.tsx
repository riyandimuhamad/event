import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { prisma } from '@eventops/db';
import { BadgeDollarSign, CheckCircle2, Clock } from 'lucide-react';
import { t } from '@/lib/i18n';

interface SponsorsPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function SponsorsPage({ params }: SponsorsPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const sponsors = await prisma.sponsor.findMany({
    where: { eventId: params.eventId },
    include: {
      deliverables: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('nav.sponsors')}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Mitra sponsor, paket kerjasama, dan pemenuhan benefit deliverable
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sponsors.map((spn) => (
          <div
            key={spn.id}
            className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200">
                  {spn.packageName}
                </span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                  {spn.companyName}
                </h2>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <BadgeDollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Nilai Paket:</span>
                <span className="font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
                  Rp {Number(spn.packageValue).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status Pembayaran:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    spn.paymentStatus === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : spn.paymentStatus === 'PARTIAL'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {spn.paymentStatus}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-xs font-bold text-zinc-500 block mb-2">Deliverable:</span>
              <div className="space-y-1.5">
                {spn.deliverables.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-700/40 border border-border"
                  >
                    <span className="truncate pr-2 text-zinc-700 dark:text-zinc-300">
                      {d.title}
                    </span>
                    {d.status === 'DELIVERED' ? (
                      <span className="text-emerald-600 font-semibold text-[10px] whitespace-nowrap">
                        ✓ Terpenuhi
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold text-[10px] whitespace-nowrap">
                        Diproses
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
