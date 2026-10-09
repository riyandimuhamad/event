import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { prisma, withOrgScope } from '@eventops/db';
import { CommitteeClient } from '@/components/features/CommitteeClient';

interface CommitteePageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function CommitteePage({ params }: CommitteePageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const [committee, rawDivisions] = await Promise.all([
    prisma.committeeMember.findMany({
      where: withOrgScope(actor.organizationId, {
        eventId: params.eventId,
        deletedAt: null,
      }),
      include: {
        division: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { fullName: 'asc' },
    }),
    prisma.division.findMany({
      where: withOrgScope(actor.organizationId, {
        eventId: params.eventId,
        deletedAt: null,
      }),
      select: { id: true, name: true, code: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const committeeData = committee.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    position: c.position,
    confirmed: c.confirmed,
    divisionId: c.divisionId,
    division: c.division ? { id: c.division.id, name: c.division.name, code: c.division.code } : { id: c.divisionId, name: 'Umum', code: 'UMM' },
  }));

  return (
    <CommitteeClient
      initialCommittee={committeeData}
      divisions={rawDivisions}
      actor={actor}
      orgSlug={params.orgSlug}
      eventId={params.eventId}
    />
  );
}
