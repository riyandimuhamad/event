import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma, withOrgScope } from '@eventops/db';
import { getCurrentActor, DEFAULT_USER_EMAIL } from '@/lib/auth/session';
import { AppShell } from '@/components/features/AppShell';
import { ToastProvider } from '@/components/ui/Toast';

interface EventLayoutProps {
  children: React.ReactNode;
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
  });

  if (!org) {
    notFound();
  }

  const event = await prisma.event.findFirst({
    where: withOrgScope(org.id, { id: params.eventId, deletedAt: null }),
  });

  if (!event) {
    notFound();
  }

  let actor;
  try {
    actor = await getCurrentActor(params.orgSlug, params.eventId);
  } catch (e: unknown) {
    notFound();
  }

  const currentEmail = cookies().get('eventops_user_email')?.value || DEFAULT_USER_EMAIL;

  return (
    <ToastProvider>
      <AppShell
        orgSlug={params.orgSlug}
        orgName={org.name}
        eventId={event.id}
        eventName={event.name}
        actor={actor}
        currentEmail={currentEmail}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
