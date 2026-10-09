import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { prisma, withOrgScope } from '@eventops/db';
import { ShieldCheck, Phone, Mail } from 'lucide-react';
import { t } from '@/lib/i18n';

interface CommitteePageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function CommitteePage({ params }: CommitteePageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const committee = await prisma.committeeMember.findMany({
    where: withOrgScope(actor.organizationId, {
      eventId: params.eventId,
      deletedAt: null,
    }),
    include: { division: true },
    orderBy: { fullName: 'asc' },
  });

  const canViewSensitiveContacts =
    actor.orgRole === 'OWNER' ||
    actor.eventRole === 'EVENT_MANAGER' ||
    actor.eventRole === 'DIVISION_HEAD';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('nav.committee')}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Struktur panitia resmi penanggung jawab event ({committee.length} orang)
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-border text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nama Panitia</th>
                <th className="px-6 py-3.5">Divisi</th>
                <th className="px-6 py-3.5">Jabatan / Posisi</th>
                <th className="px-6 py-3.5">Kontak</th>
                <th className="px-6 py-3.5">Status Konfirmasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {committee.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/20">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-text flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accent dark:text-[#FFC46B]" />
                      <span>{c.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      {c.division?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {c.position || '-'}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {canViewSensitiveContacts ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="italic text-zinc-400">Kontak disamarkan (RBAC)</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Terkonfirmasi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
