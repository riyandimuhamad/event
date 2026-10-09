import React from 'react';
import { prisma } from '@eventops/db';
import { LandingPageClient } from '@/components/features/LandingPageClient';

export default async function HomePage() {
  const defaultEvent = await prisma.event.findFirst({
    include: { organization: true },
  });

  const orgSlug = defaultEvent?.organization?.slug || 'nusantara-creative';
  const eventId = defaultEvent?.id || '697840e1-5ace-48fa-b866-f4825cc05c22';
  const dashboardUrl = `/${orgSlug}/events/${eventId}/overview`;

  return <LandingPageClient dashboardUrl={dashboardUrl} />;
}
