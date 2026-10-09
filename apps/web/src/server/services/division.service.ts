import { prisma, withOrgScope } from '@eventops/db';
import { Actor, RbacGuard } from '@eventops/shared';
import { AuditLogger } from '@/lib/audit/audit-logger';

export class DivisionService {
  public static async getDivisions(actor: Actor, eventId: string) {
    if (!RbacGuard.can(actor, 'read', 'division', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    return prisma.division.findMany({
      where: withOrgScope(actor.organizationId, {
        eventId,
        deletedAt: null,
      }),
      include: {
        headUser: { select: { id: true, fullName: true, email: true } },
        _count: {
          select: {
            committeeMembers: { where: { deletedAt: null } },
            volunteers: { where: { deletedAt: null } },
            requisitionsFrom: { where: { status: { notIn: ['CLOSED', 'REJECTED'] } } },
            requisitionsTo: { where: { status: { notIn: ['CLOSED', 'REJECTED'] } } },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  public static async createDivision(
    actor: Actor,
    eventId: string,
    data: { name: string; code: string; description?: string; headUserId?: string }
  ) {
    if (!RbacGuard.can(actor, 'write', 'division', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    return prisma.$transaction(async (tx) => {
      const division = await tx.division.create({
        data: {
          organizationId: actor.organizationId,
          eventId,
          name: data.name,
          code: data.code.toUpperCase(),
          description: data.description,
          headUserId: data.headUserId,
        },
      });

      if (data.headUserId) {
        await tx.divisionMember.create({
          data: {
            divisionId: division.id,
            userId: data.headUserId,
            role: 'HEAD',
          },
        });
      }

      await AuditLogger.log(
        {
          organizationId: actor.organizationId,
          eventId,
          actorId: actor.userId,
          action: 'division.created',
          entityType: 'Division',
          entityId: division.id,
          after: { name: data.name, code: data.code },
        },
        tx
      );

      return division;
    });
  }

  public static async softDeleteDivision(actor: Actor, divisionId: string) {
    const division = await prisma.division.findFirst({
      where: withOrgScope(actor.organizationId, { id: divisionId, deletedAt: null }),
      include: {
        _count: {
          select: {
            committeeMembers: { where: { deletedAt: null } },
            volunteers: { where: { deletedAt: null } },
            requisitionsFrom: { where: { status: { notIn: ['CLOSED', 'REJECTED'] } } },
            requisitionsTo: { where: { status: { notIn: ['CLOSED', 'REJECTED'] } } },
          },
        },
      },
    });

    if (!division) throw new Error('NOT_FOUND');

    // Rule B2: Divisi tidak boleh dihapus jika masih memiliki committee, volunteer, atau kebutuhan terbuka.
    const { committeeMembers, volunteers, requisitionsFrom, requisitionsTo } = division._count;
    if (committeeMembers > 0 || volunteers > 0 || requisitionsFrom > 0 || requisitionsTo > 0) {
      const err = new Error(
        'Divisi tidak dapat dihapus karena masih memiliki anggota panitia, relawan, atau kebutuhan terbuka.'
      );
      (err as unknown as { code: string }).code = 'DIVISION_HAS_ACTIVE_DEPENDENCIES';
      throw err;
    }

    const updated = await prisma.division.update({
      where: { id: division.id },
      data: { deletedAt: new Date() },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId: division.eventId,
      actorId: actor.userId,
      action: 'division.deleted',
      entityType: 'Division',
      entityId: division.id,
      before: { name: division.name },
    });

    return updated;
  }
}
