import { prisma, withOrgScope } from '@eventops/db';
import {
  Actor,
  RbacGuard,
  RequisitionStateMachine,
  RequisitionStatus,
  RequisitionPriority,
} from '@eventops/shared';
import { AuditLogger } from '@/lib/audit/audit-logger';

export interface CreateRequisitionInput {
  title: string;
  description?: string;
  fromDivisionId: string;
  toDivisionId: string;
  priority: RequisitionPriority;
  neededBy?: Date;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
}

export class RequisitionService {
  public static async getRequisitions(
    actor: Actor,
    eventId: string,
    type: 'incoming' | 'outgoing' | 'all' = 'all'
  ) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId: actor.organizationId },
    });
    if (!event) {
      throw new Error('FORBIDDEN');
    }

    if (!RbacGuard.can(actor, 'read', 'requisition', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const whereClause: Record<string, unknown> = withOrgScope(actor.organizationId, {
      eventId,
    });

    if (type === 'incoming' && actor.divisionId) {
      whereClause.toDivisionId = actor.divisionId;
    } else if (type === 'outgoing' && actor.divisionId) {
      whereClause.fromDivisionId = actor.divisionId;
    }

    return prisma.requisition.findMany({
      where: whereClause,
      include: {
        fromDivision: true,
        toDivision: true,
        requester: { select: { fullName: true, email: true } },
        approver: { select: { fullName: true, email: true } },
        items: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  public static async getRequisitionById(actor: Actor, id: string) {
    const req = await prisma.requisition.findFirst({
      where: withOrgScope(actor.organizationId, { id }),
      include: {
        fromDivision: true,
        toDivision: true,
        requester: true,
        approver: true,
        items: true,
        events: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!req) {
      throw new Error('NOT_FOUND');
    }

    const comments = await prisma.comment.findMany({
      where: { organizationId: actor.organizationId, entityType: 'Requisition', entityId: id },
      orderBy: { createdAt: 'asc' },
    });

    return { ...req, comments };
  }

  public static async createRequisition(
    actor: Actor,
    eventId: string,
    input: CreateRequisitionInput,
    submitImmediately = false
  ) {
    if (
      !RbacGuard.can(actor, 'write', 'requisition', {
        organizationId: actor.organizationId,
        eventId,
        divisionId: input.fromDivisionId,
      })
    ) {
      throw new Error('FORBIDDEN');
    }

    // Generate code REQ-XXXX
    const count = await prisma.requisition.count({ where: { eventId } });
    const code = `REQ-${(count + 1).toString().padStart(4, '0')}`;
    const initialStatus: RequisitionStatus = submitImmediately ? 'SUBMITTED' : 'DRAFT';

    return prisma.$transaction(async (tx) => {
      const created = await tx.requisition.create({
        data: {
          organizationId: actor.organizationId,
          eventId,
          code,
          title: input.title,
          description: input.description,
          fromDivisionId: input.fromDivisionId,
          toDivisionId: input.toDivisionId,
          priority: input.priority,
          neededBy: input.neededBy,
          status: initialStatus,
          requestedBy: actor.userId,
          items: {
            create: input.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unit: i.unit,
              notes: i.notes,
            })),
          },
        },
        include: { items: true },
      });

      await tx.requisitionEvent.create({
        data: {
          requisitionId: created.id,
          fromStatus: null,
          toStatus: initialStatus,
          actorId: actor.userId,
          reason: submitImmediately ? 'Diajukan langsung saat pembuatan.' : 'Dibuat sebagai draft.',
        },
      });

      await AuditLogger.log(
        {
          organizationId: actor.organizationId,
          eventId,
          actorId: actor.userId,
          action: 'requisition.created',
          entityType: 'Requisition',
          entityId: created.id,
          after: { code, title: input.title, status: initialStatus, priority: input.priority },
        },
        tx
      );

      return created;
    });
  }

  public static async transitionStatus(
    actor: Actor,
    id: string,
    targetStatus: RequisitionStatus,
    reason?: string
  ) {
    const req = await prisma.requisition.findFirst({
      where: withOrgScope(actor.organizationId, { id }),
      include: { fromDivision: true, toDivision: true },
    });

    if (!req) {
      throw new Error('NOT_FOUND');
    }

    const currentStatus = req.status as RequisitionStatus;

    // Check transition rules with RequisitionStateMachine
    const check = RequisitionStateMachine.canTransition(currentStatus, targetStatus, {
      actorId: actor.userId,
      actorDivisionId: actor.divisionId,
      isActorDivisionHead: actor.eventRole === 'DIVISION_HEAD',
      isEventManagerOrOwner: actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER',
      requestedBy: req.requestedBy,
      fromDivisionId: req.fromDivisionId,
      toDivisionId: req.toDivisionId,
      reason,
    });

    if (!check.valid) {
      const err = new Error(check.error);
      (err as unknown as { code: string }).code = check.errorCode || 'TRANSITION_ERROR';
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.requisition.update({
        where: { id: req.id },
        data: {
          status: targetStatus,
          approvedBy: targetStatus === 'APPROVED' ? actor.userId : req.approvedBy,
          version: { increment: 1 },
        },
      });

      await tx.requisitionEvent.create({
        data: {
          requisitionId: req.id,
          fromStatus: currentStatus,
          toStatus: targetStatus,
          actorId: actor.userId,
          reason,
        },
      });

      await AuditLogger.log(
        {
          organizationId: actor.organizationId,
          eventId: req.eventId,
          actorId: actor.userId,
          action: `requisition.status_${targetStatus.toLowerCase()}`,
          entityType: 'Requisition',
          entityId: req.id,
          before: { status: currentStatus },
          after: { status: targetStatus, reason },
        },
        tx
      );

      return updated;
    });
  }
}
