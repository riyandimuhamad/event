import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { DivisionService } from '@/server/services/division.service';
import { prisma, withOrgScope } from '@eventops/db';
import { DivisionsClient } from '@/components/features/DivisionsClient';

interface DivisionsPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function DivisionsPage({ params }: DivisionsPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const [divisions, users] = await Promise.all([
    DivisionService.getDivisions(actor, params.eventId),
    prisma.user.findMany({
      where: {
        memberships: {
          some: { organizationId: actor.organizationId },
        },
      },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  return (
    <DivisionsClient
      initialDivisions={divisions}
      users={users}
      actor={actor}
      orgSlug={params.orgSlug}
      eventId={params.eventId}
    />
  );
}
