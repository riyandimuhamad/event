import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { VolunteerService } from '@/server/services/volunteer.service';
import { DivisionService } from '@/server/services/division.service';
import { VolunteersClient } from '@/components/features/VolunteersClient';

interface VolunteersPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function VolunteersPage({ params }: VolunteersPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const rawVolunteers = await VolunteerService.getVolunteers(actor, params.eventId);
  const rawDivisions = await DivisionService.getDivisions(actor, params.eventId);
  const rawShifts = await VolunteerService.getShifts(actor, params.eventId);

  const volunteers = rawVolunteers.map((v) => ({
    id: v.id,
    code: v.code,
    fullName: v.fullName,
    email: v.email,
    phone: v.phone,
    shirtSize: v.shirtSize,
    registrationStatus: v.registrationStatus,
    divisionId: v.divisionId,
    division: v.division ? { id: v.division.id, name: v.division.name, code: v.division.code } : null,
    shifts: v.shifts.map((s) => ({
      id: s.id,
      status: s.status,
      checkedInAt: s.checkedInAt ? s.checkedInAt.toISOString() : null,
      shift: {
        id: s.shift.id,
        name: s.shift.name,
        startsAt: s.shift.startsAt.toISOString(),
        endsAt: s.shift.endsAt.toISOString(),
      },
    })),
  }));

  const divisions = rawDivisions.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
  }));

  const availableShifts = rawShifts.map((s) => ({
    id: s.id,
    name: s.name,
    divisionId: s.divisionId,
    divisionName: s.division?.name || '',
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
  }));

  return (
    <VolunteersClient
      initialVolunteers={volunteers}
      divisions={divisions}
      availableShifts={availableShifts}
      actor={actor}
      orgSlug={params.orgSlug}
      eventId={params.eventId}
    />
  );
}
