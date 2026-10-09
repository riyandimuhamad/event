import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { BenefitService } from '@/server/services/benefit.service';
import { PostEventClient } from '@/components/features/PostEventClient';

interface PostEventPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function PostEventPage({ params }: PostEventPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const rawBenefits = await BenefitService.getBenefits(actor, params.eventId);

  const benefits = rawBenefits.map((b) => ({
    id: b.id,
    recipientType: b.recipientType,
    recipientId: b.recipientId,
    recipientName: b.recipientName,
    recipientDivision: b.recipientDivision,
    kind: b.kind,
    amountNumber: b.amountNumber,
    status: b.status,
    paidAt: b.paidAt ? b.paidAt.toISOString() : null,
    certificateNumber: b.certificateNumber,
  }));

  return (
    <PostEventClient
      benefits={benefits}
      actor={actor}
      orgSlug={params.orgSlug}
      eventId={params.eventId}
    />
  );
}
