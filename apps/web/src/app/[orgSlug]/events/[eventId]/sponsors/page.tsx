import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { prisma } from '@eventops/db';
import { SponsorsClient } from '@/components/features/SponsorsClient';

interface SponsorsPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function SponsorsPage({ params }: SponsorsPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const rawSponsors = await prisma.sponsor.findMany({
    where: { eventId: params.eventId },
    include: {
      deliverables: true,
    },
    orderBy: { packageValue: 'desc' },
  });

  const sponsors = rawSponsors.map((spn) => ({
    id: spn.id,
    companyName: spn.companyName,
    packageName: spn.packageName,
    packageValue: Number(spn.packageValue),
    paymentStatus: spn.paymentStatus,
    amountPaid: Number(spn.amountPaid),
    repName: spn.repName,
    repEmail: spn.repEmail,
    deliverables: spn.deliverables.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      deliveredAt: d.deliveredAt ? d.deliveredAt.toISOString() : null,
    })),
  }));

  return (
    <SponsorsClient
      initialSponsors={sponsors}
      actor={actor}
      orgSlug={params.orgSlug}
      eventId={params.eventId}
    />
  );
}
