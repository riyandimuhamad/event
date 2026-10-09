import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { ConsumptionService } from '@/server/services/consumption.service';
import { DayOfClient } from '@/components/features/DayOfClient';

interface DayOfPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function DayOfPage({ params }: DayOfPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const rawSlots = await ConsumptionService.getSlots(actor, params.eventId);
  const firstSlotId = rawSlots[0]?.id || '';
  const recipients = firstSlotId
    ? await ConsumptionService.getSlotRecipients(actor, params.eventId, firstSlotId)
    : [];

  const slots = rawSlots.map((s) => ({
    id: s.id,
    kind: s.kind,
    label: s.label,
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
    targetRecipients: s.targetRecipients,
    servedCount: s.servedCount,
    status: s.status,
  }));

  return (
    <DayOfClient
      slots={slots}
      initialRecipients={recipients}
      actor={actor}
      orgSlug={params.orgSlug}
      eventId={params.eventId}
    />
  );
}
