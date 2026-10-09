import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@eventops/db';
import { getCurrentActor, DEFAULT_USER_EMAIL } from '@/lib/auth/session';
import { EventService } from '@/server/services/event.service';
import { EventsClient, EventData } from '@/components/features/EventsClient';
import { AppShell } from '@/components/features/AppShell';
import { ToastProvider } from '@/components/ui/Toast';

interface OrganizationEventsPageProps {
  params: {
    orgSlug: string;
  };
}

export default async function OrganizationEventsPage({
  params,
}: OrganizationEventsPageProps) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
  });

  if (!org) {
    notFound();
  }

  const actor = await getCurrentActor(params.orgSlug);
  const rawEvents = await EventService.getEvents(actor);

  const initialEvents: EventData[] = rawEvents.map((ev) => ({
    id: ev.id,
    name: ev.name,
    slug: ev.slug,
    description: ev.description,
    venueName: ev.venueName,
    venueAddress: ev.venueAddress,
    startsAt: ev.startsAt.toISOString(),
    endsAt: ev.endsAt.toISOString(),
    status: ev.status,
    currentPhase: ev.currentPhase,
    expectedAttendees: ev.expectedAttendees,
    divisionsCount: ev.divisions?.length || 0,
    volunteersCount: ev.volunteers?.length || 0,
    committeeCount: ev.committeeMembers?.length || 0,
    shiftsCount: ev.shifts?.length || 0,
  }));

  const activeEventId = rawEvents[0]?.id || '697840e1-5ace-48fa-b866-f4825cc05c22';
  const currentEmail = cookies().get('eventops_user_email')?.value || DEFAULT_USER_EMAIL;

  return (
    <ToastProvider>
      <AppShell
        orgSlug={params.orgSlug}
        orgName={org.name}
        eventId={activeEventId}
        eventName="Manajemen Event EO"
        actor={actor}
        currentEmail={currentEmail}
      >
        <EventsClient
          initialEvents={initialEvents}
          actor={actor}
          orgSlug={params.orgSlug}
          orgName={org.name}
        />
      </AppShell>
    </ToastProvider>
  );
}
