import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { prisma, withOrgScope } from '@eventops/db';
import { Truck, Phone, Mail, FileText, UserCheck } from 'lucide-react';
import { t } from '@/lib/i18n';

interface VendorsPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function VendorsPage({ params }: VendorsPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const vendors = await prisma.vendor.findMany({
    where: withOrgScope(actor.organizationId, { deletedAt: null }),
    include: {
      orders: { where: { eventId: params.eventId } },
      crews: { where: { eventId: params.eventId } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('nav.vendors')}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Mitra vendor eksternal, pesanan logistik, dan daftar kru lapangan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vendors.map((v) => (
          <div
            key={v.id}
            className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-muted text-text-muted">
                  {v.category}
                </span>
                <h2 className="text-lg font-bold text-text mt-1">
                  {v.name}
                </h2>
              </div>
              <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent dark:text-[#FFC46B] border border-accent/20 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>

            <div className="text-xs text-zinc-500 space-y-1">
              <div>Kontak: <strong className="text-zinc-800 dark:text-zinc-200">{v.contactName}</strong></div>
              {v.contactPhone && <div>Telepon: {v.contactPhone}</div>}
              {v.contactEmail && <div>Email: {v.contactEmail}</div>}
            </div>

            <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-700/50 p-2.5 rounded-lg border border-border">
                <span className="text-zinc-400 block mb-0.5">Pesanan Kontrak:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {v.orders.length} Pesanan
                </span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-700/50 p-2.5 rounded-lg border border-border">
                <span className="text-zinc-400 block mb-0.5">Kru Lapangan:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {v.crews.length} Orang
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
