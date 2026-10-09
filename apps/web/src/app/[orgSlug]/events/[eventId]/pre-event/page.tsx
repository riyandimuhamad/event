import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { prisma, withOrgScope } from '@eventops/db';
import { Package, Shirt, CreditCard, ShieldCheck } from 'lucide-react';
import { t } from '@/lib/i18n';

interface PreEventPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function PreEventPage({ params }: PreEventPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const items = await prisma.inventoryItem.findMany({
    where: { eventId: params.eventId },
    include: {
      _count: { select: { distributions: true } },
    },
    orderBy: { category: 'asc' },
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('nav.preEvent')}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Manajemen logistik persiapan: stok kaos, ID card, dan perlengkapan resmi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => {
          const remaining = item.totalStock - item.distributed;
          const percentage = item.totalStock > 0 ? Math.round((item.distributed / item.totalStock) * 100) : 0;
          const Icon = item.category === 'SHIRT' ? Shirt : (item.category === 'ID_CARD' ? CreditCard : Package);

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-800 border border-border rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700">
                  {item.category}
                </span>
              </div>

              <div>
                <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{item.name}</h2>
                {item.variant && (
                  <p className="text-xs text-zinc-500 mt-0.5">Varian: {item.variant}</p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Total Stok Fisik:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                    {item.totalStock} unit
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Telah Diambil:</span>
                  <span className="font-bold text-emerald-600 tabular-nums">
                    {item.distributed} unit
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Sisa Tersedia:</span>
                  <span className="font-bold text-indigo-600 tabular-nums">
                    {remaining} unit
                  </span>
                </div>

                <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
