import { prisma, withOrgScope } from '@eventops/db';
import { Actor, RbacGuard } from '@eventops/shared';
import { AuditLogger } from '@/lib/audit/audit-logger';

export class TalentService {
  public static async getTalents(actor: Actor, eventId: string) {
    if (!RbacGuard.can(actor, 'read', 'talent', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    return prisma.talent.findMany({
      where: { eventId },
      include: {
        shows: { orderBy: { startsAt: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  public static async createTalent(
    actor: Actor,
    eventId: string,
    data: {
      name: string;
      category: string;
      managementName?: string;
      managementContact?: string;
      managementEmail?: string;
      riderNotes?: string;
      fee?: number;
    }
  ) {
    if (!RbacGuard.can(actor, 'write', 'talent', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const created = await prisma.talent.create({
      data: {
        eventId,
        name: data.name,
        category: data.category,
        managementName: data.managementName,
        managementContact: data.managementContact,
        managementEmail: data.managementEmail,
        riderNotes: data.riderNotes,
        fee: data.fee ? BigInt(data.fee) : null,
        contractStatus: 'SIGNED',
      },
      include: {
        shows: true,
      },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'talent.created',
      entityType: 'Talent',
      entityId: created.id,
      after: { name: created.name, category: created.category },
    });

    return created;
  }

  public static async createTalentShow(
    actor: Actor,
    eventId: string,
    talentId: string,
    data: {
      stageName: string;
      startsAt: Date;
      endsAt: Date;
    }
  ) {
    if (!RbacGuard.can(actor, 'write', 'talent', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const created = await prisma.talentShow.create({
      data: {
        talentId,
        stageName: data.stageName,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        status: 'SCHEDULED',
      },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'talent_show.created',
      entityType: 'TalentShow',
      entityId: created.id,
      after: { talentId, stageName: data.stageName },
    });

    return created;
  }

  public static async deleteTalent(actor: Actor, eventId: string, talentId: string) {
    if (!RbacGuard.can(actor, 'write', 'talent', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const talent = await prisma.talent.findFirst({
      where: { id: talentId, eventId },
    });

    if (!talent) throw new Error('NOT_FOUND');

    await prisma.talentShow.deleteMany({ where: { talentId: talent.id } });
    await prisma.talent.delete({ where: { id: talent.id } });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'talent.deleted',
      entityType: 'Talent',
      entityId: talent.id,
      before: { name: talent.name },
    });

    return talent;
  }
}
