import { prisma, withOrgScope } from '@eventops/db';
import { Actor, RbacGuard } from '@eventops/shared';

export class EventService {
  public static async getEventBySlug(actor: Actor, slug: string) {
    const event = await prisma.event.findFirst({
      where: withOrgScope(actor.organizationId, { slug, deletedAt: null }),
      include: {
        organization: true,
        phases: { orderBy: { startsAt: 'asc' } },
        divisions: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!event) throw new Error('NOT_FOUND');
    return event;
  }

  public static async getEventDashboard(actor: Actor, eventId: string) {
    if (!RbacGuard.can(actor, 'read', 'event', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const event = await prisma.event.findFirst({
      where: withOrgScope(actor.organizationId, { id: eventId, deletedAt: null }),
      include: {
        phases: { orderBy: { startsAt: 'asc' } },
      },
    });

    if (!event) throw new Error('NOT_FOUND');

    // Aggregate counts
    const totalVolunteers = await prisma.volunteer.count({
      where: { eventId, deletedAt: null },
    });

    const checkedInVolunteers = await prisma.volunteerShift.count({
      where: {
        shift: { eventId },
        checkedInAt: { not: null },
      },
    });

    const requisitions = await prisma.requisition.findMany({
      where: { eventId },
      select: { status: true, priority: true },
    });

    const openRequisitionsCount = requisitions.filter(
      (r) => r.status !== 'CLOSED' && r.status !== 'REJECTED'
    ).length;

    const urgentRequisitionsCount = requisitions.filter(
      (r) => r.priority === 'URGENT' && r.status !== 'CLOSED'
    ).length;

    const slots = await prisma.consumptionSlot.findMany({
      where: { eventId },
      select: { targetRecipients: true, servedCount: true },
    });

    const totalMealsTarget = slots.reduce((acc, s) => acc + s.targetRecipients, 0);
    const totalMealsServed = slots.reduce((acc, s) => acc + s.servedCount, 0);

    const benefits = await prisma.benefit.findMany({
      where: { eventId, kind: 'FEE' },
      select: { status: true, amount: true },
    });

    const totalFeesCount = benefits.length;
    const paidFeesCount = benefits.filter((b) => b.status === 'PAID').length;

    // Recent 10 audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: actor.organizationId, eventId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      event,
      metrics: {
        totalVolunteers,
        checkedInVolunteers,
        attendancePercentage: totalVolunteers > 0 ? Math.round((checkedInVolunteers / totalVolunteers) * 100) : 0,
        openRequisitionsCount,
        urgentRequisitionsCount,
        totalMealsTarget,
        totalMealsServed,
        mealPercentage: totalMealsTarget > 0 ? Math.round((totalMealsServed / totalMealsTarget) * 100) : 0,
        totalFeesCount,
        paidFeesCount,
        feePercentage: totalFeesCount > 0 ? Math.round((paidFeesCount / totalFeesCount) * 100) : 0,
      },
      auditLogs,
    };
  }
}
