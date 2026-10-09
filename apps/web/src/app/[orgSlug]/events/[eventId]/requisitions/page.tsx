import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { RequisitionService } from '@/server/services/requisition.service';
import { DivisionService } from '@/server/services/division.service';
import { RequisitionsClient } from '@/components/features/RequisitionsClient';

interface RequisitionsPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function RequisitionsPage({ params }: RequisitionsPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const rawRequisitions = await RequisitionService.getRequisitions(actor, params.eventId, 'all');
  const rawDivisions = await DivisionService.getDivisions(actor, params.eventId);

  const requisitions = rawRequisitions.map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    description: r.description,
    fromDivisionId: r.fromDivisionId,
    toDivisionId: r.toDivisionId,
    priority: r.priority,
    status: r.status,
    neededBy: r.neededBy ? r.neededBy.toISOString() : null,
    requestedBy: r.requestedBy,
    fromDivision: { id: r.fromDivision.id, name: r.fromDivision.name, code: r.fromDivision.code },
    toDivision: { id: r.toDivision.id, name: r.toDivision.name, code: r.toDivision.code },
    requester: { fullName: r.requester.fullName, email: r.requester.email },
    items: r.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: Number(i.quantity),
      unit: i.unit,
    })),
    events: r.events.map((e) => ({
      id: e.id,
      fromStatus: e.fromStatus,
      toStatus: e.toStatus,
      actorId: e.actorId,
      reason: e.reason,
      createdAt: e.createdAt.toISOString(),
    })),
  }));

  const divisions = rawDivisions.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
  }));

  return (
    <RequisitionsClient
      initialRequisitions={requisitions}
      divisions={divisions}
      actor={actor}
      orgSlug={params.orgSlug}
      eventId={params.eventId}
    />
  );
}
