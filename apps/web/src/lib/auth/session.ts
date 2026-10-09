import { cookies } from 'next/headers';
import { prisma } from '@eventops/db';
import { Actor } from '@eventops/shared';

export const DEFAULT_USER_EMAIL = 'owner@eventops.local';

export async function getCurrentActor(orgSlug: string, eventId?: string): Promise<Actor> {
  const cookieStore = cookies();
  const currentEmail = cookieStore.get('eventops_user_email')?.value || DEFAULT_USER_EMAIL;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });

  if (!org) {
    throw new Error('NOT_FOUND');
  }

  const user = await prisma.user.findUnique({
    where: { email: currentEmail },
    include: {
      memberships: {
        where: { organizationId: org.id },
      },
      divisionMembers: true,
    },
  });

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  const orgRole = (user.memberships[0]?.role as 'OWNER' | 'ADMIN' | 'MEMBER') || 'MEMBER';

  // Determine event role and division
  let eventRole: Actor['eventRole'] = undefined;
  let divisionId: string | undefined = undefined;

  if (eventId) {
    // Check if Division Head
    const divHead = await prisma.division.findFirst({
      where: { eventId, headUserId: user.id, deletedAt: null },
    });

    if (divHead) {
      eventRole = 'DIVISION_HEAD';
      divisionId = divHead.id;
    } else if (orgRole === 'OWNER') {
      eventRole = 'OWNER';
    } else if (orgRole === 'ADMIN') {
      eventRole = 'EVENT_MANAGER';
    } else {
      // Check if committee
      const committee = await prisma.committeeMember.findFirst({
        where: { eventId, userId: user.id, deletedAt: null },
      });
      if (committee) {
        eventRole = 'COMMITTEE';
        divisionId = committee.divisionId;
      } else {
        // Check if volunteer
        const volunteer = await prisma.volunteer.findFirst({
          where: { eventId, userId: user.id, deletedAt: null },
        });
        if (volunteer) {
          eventRole = 'VOLUNTEER';
          divisionId = volunteer.divisionId || undefined;
        } else if (user.email.includes('talent')) {
          eventRole = 'TALENT_MANAGER';
        } else if (user.email.includes('sponsor')) {
          eventRole = 'SPONSOR_REP';
        } else if (user.email.includes('vendor')) {
          eventRole = 'VENDOR_ADMIN';
        }
      }
    }
  } else {
    eventRole = orgRole === 'OWNER' ? 'OWNER' : 'EVENT_MANAGER';
  }

  return {
    userId: user.id,
    organizationId: org.id,
    orgRole,
    eventId,
    eventRole,
    divisionId,
  };
}
