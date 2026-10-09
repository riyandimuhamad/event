import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { prisma } from '@eventops/db';
import { TalentsClient } from '@/components/features/TalentsClient';

interface TalentsPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function TalentsPage({ params }: TalentsPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const rawTalents = await prisma.talent.findMany({
    where: { eventId: params.eventId },
    include: {
      shows: { orderBy: { startsAt: 'asc' } },
    },
    orderBy: { name: 'asc' },
  });

  const talents = rawTalents.map((tlt) => ({
    id: tlt.id,
    name: tlt.name,
    category: tlt.category,
    managementName: tlt.managementName,
    managementContact: tlt.managementContact,
    managementEmail: tlt.managementEmail,
    riderNotes: tlt.riderNotes,
    fee: tlt.fee ? Number(tlt.fee) : null,
    contractStatus: tlt.contractStatus,
    shows: tlt.shows.map((s) => ({
      id: s.id,
      stageName: s.stageName,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
    })),
  }));

  return (
    <TalentsClient
      initialTalents={talents}
      actor={actor}
      orgSlug={params.orgSlug}
      eventId={params.eventId}
    />
  );
}
