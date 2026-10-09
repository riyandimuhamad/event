import { prisma, withOrgScope } from '@eventops/db';
import { Actor, RbacGuard } from '@eventops/shared';
import { AuditLogger } from '@/lib/audit/audit-logger';

export class CommitteeService {
  public static async getCommittee(actor: Actor, eventId: string) {
    if (!RbacGuard.can(actor, 'read', 'committee', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    return prisma.committeeMember.findMany({
      where: withOrgScope(actor.organizationId, {
        eventId,
        deletedAt: null,
      }),
      include: {
        division: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  public static async createCommitteeMember(
    actor: Actor,
    eventId: string,
    data: {
      divisionId: string;
      fullName: string;
      email?: string;
      phone?: string;
      position?: string;
    }
  ) {
    if (!RbacGuard.can(actor, 'write', 'committee', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const created = await prisma.committeeMember.create({
      data: {
        organizationId: actor.organizationId,
        eventId,
        divisionId: data.divisionId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        position: data.position || 'Staf Divisi',
        confirmed: true,
      },
      include: {
        division: true,
      },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'committee.created',
      entityType: 'CommitteeMember',
      entityId: created.id,
      after: { fullName: created.fullName, divisionId: data.divisionId, position: created.position },
    });

    return created;
  }

  public static async deleteCommitteeMember(actor: Actor, committeeMemberId: string) {
    if (!RbacGuard.can(actor, 'write', 'committee', { organizationId: actor.organizationId })) {
      throw new Error('FORBIDDEN');
    }

    const member = await prisma.committeeMember.findFirst({
      where: withOrgScope(actor.organizationId, { id: committeeMemberId, deletedAt: null }),
    });

    if (!member) throw new Error('NOT_FOUND');

    const updated = await prisma.committeeMember.update({
      where: { id: member.id },
      data: { deletedAt: new Date() },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId: member.eventId,
      actorId: actor.userId,
      action: 'committee.deleted',
      entityType: 'CommitteeMember',
      entityId: member.id,
      before: { fullName: member.fullName },
    });

    return updated;
  }
}
