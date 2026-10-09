import { prisma, withOrgScope } from '@eventops/db';
import { Actor, RbacGuard } from '@eventops/shared';
import { AuditLogger } from '@/lib/audit/audit-logger';

export class SponsorService {
  public static async getSponsors(actor: Actor, eventId: string) {
    if (!RbacGuard.can(actor, 'read', 'sponsor', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    return prisma.sponsor.findMany({
      where: { eventId },
      include: {
        deliverables: true,
      },
      orderBy: { packageValue: 'desc' },
    });
  }

  public static async createSponsor(
    actor: Actor,
    eventId: string,
    data: {
      companyName: string;
      packageName: string;
      packageValue: number;
      amountPaid?: number;
      paymentStatus?: string;
      repName?: string;
      repEmail?: string;
    }
  ) {
    if (!RbacGuard.can(actor, 'write', 'sponsor', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const packageValue = BigInt(data.packageValue || 0);
    const amountPaid = BigInt(data.amountPaid || 0);

    const created = await prisma.sponsor.create({
      data: {
        eventId,
        companyName: data.companyName,
        packageName: data.packageName,
        packageValue,
        amountPaid,
        paymentStatus: data.paymentStatus || (amountPaid >= packageValue ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID'),
        repName: data.repName,
        repEmail: data.repEmail,
      },
      include: {
        deliverables: true,
      },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'sponsor.created',
      entityType: 'Sponsor',
      entityId: created.id,
      after: { companyName: created.companyName, packageName: created.packageName },
    });

    return created;
  }

  public static async createDeliverable(
    actor: Actor,
    eventId: string,
    sponsorId: string,
    data: {
      title: string;
      status?: string;
    }
  ) {
    if (!RbacGuard.can(actor, 'write', 'sponsor', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const created = await prisma.sponsorDeliverable.create({
      data: {
        sponsorId,
        title: data.title,
        status: data.status || 'IN_PROGRESS',
      },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'sponsor_deliverable.created',
      entityType: 'SponsorDeliverable',
      entityId: created.id,
      after: { sponsorId, title: data.title },
    });

    return created;
  }

  public static async deleteSponsor(actor: Actor, eventId: string, sponsorId: string) {
    if (!RbacGuard.can(actor, 'write', 'sponsor', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const sponsor = await prisma.sponsor.findFirst({
      where: { id: sponsorId, eventId },
    });

    if (!sponsor) throw new Error('NOT_FOUND');

    await prisma.sponsorDeliverable.deleteMany({ where: { sponsorId: sponsor.id } });
    await prisma.sponsor.delete({ where: { id: sponsor.id } });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'sponsor.deleted',
      entityType: 'Sponsor',
      entityId: sponsor.id,
      before: { companyName: sponsor.companyName },
    });

    return sponsor;
  }
}
