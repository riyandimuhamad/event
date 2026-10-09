import { prisma, withOrgScope } from '@eventops/db';
import { Actor, RbacGuard, RecipientType } from '@eventops/shared';
import { AuditLogger } from '@/lib/audit/audit-logger';

export interface DistributeMealInput {
  slotId: string;
  recipientType: RecipientType;
  recipientId: string;
  quantity?: number;
  clientOpId?: string;
}

export class ConsumptionService {
  public static async getSlots(actor: Actor, eventId: string) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId: actor.organizationId },
    });
    if (!event) {
      throw new Error('FORBIDDEN');
    }

    if (!RbacGuard.can(actor, 'read', 'consumption', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    return prisma.consumptionSlot.findMany({
      where: { eventId },
      include: {
        _count: { select: { distributions: true } },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  public static async getSlotRecipients(actor: Actor, eventId: string, slotId: string) {
    if (!RbacGuard.can(actor, 'read', 'consumption', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    // Get volunteers in event who have checked in
    const volunteers = await prisma.volunteer.findMany({
      where: withOrgScope(actor.organizationId, {
        eventId,
        deletedAt: null,
      }),
      include: {
        shifts: true,
      },
      take: 100,
    });

    const distributions = await prisma.consumptionDistribution.findMany({
      where: { slotId },
    });

    const servedMap = new Set(distributions.map((d) => d.recipientId));

    return volunteers.map((v) => {
      const hasCheckedIn = v.shifts.some((s) => s.checkedInAt !== null);
      const isServed = servedMap.has(v.id);
      return {
        id: v.id,
        code: v.code,
        fullName: v.fullName,
        type: 'VOLUNTEER' as RecipientType,
        hasCheckedIn,
        isServed,
      };
    });
  }

  public static async distributeMeal(actor: Actor, input: DistributeMealInput) {
    if (!RbacGuard.can(actor, 'write', 'consumption', { organizationId: actor.organizationId })) {
      throw new Error('FORBIDDEN');
    }

    // Check idempotency with clientOpId
    if (input.clientOpId) {
      const existingOp = await prisma.consumptionDistribution.findUnique({
        where: { clientOpId: input.clientOpId },
      });
      if (existingOp) {
        return { success: true, distribution: existingOp, idempotent: true };
      }
    }

    return prisma.$transaction(async (tx) => {
      const slot = await tx.consumptionSlot.findUnique({
        where: { id: input.slotId },
      });

      if (!slot) {
        throw new Error('SLOT_NOT_FOUND');
      }

      // Rule B6: Slot yang CLOSED MUST NOT menerima distribusi baru.
      if (slot.status === 'CLOSED') {
        const err = new Error('Slot konsumsi sudah ditutup.');
        (err as unknown as { code: string }).code = 'SLOT_CLOSED';
        throw err;
      }

      // Rule B6: Satu penerima hanya boleh menerima satu kali per slot
      const alreadyDistributed = await tx.consumptionDistribution.findUnique({
        where: {
          slotId_recipientType_recipientId: {
            slotId: input.slotId,
            recipientType: input.recipientType,
            recipientId: input.recipientId,
          },
        },
      });

      if (alreadyDistributed) {
        const err = new Error('Penerima sudah mendapatkan makanan pada slot konsumsi ini.');
        (err as unknown as { code: string }).code = 'ALREADY_SERVED';
        throw err;
      }

      // Rule B6: Pemberian makan hanya boleh untuk relawan yang sudah check-in
      if (input.recipientType === 'VOLUNTEER') {
        const vol = await tx.volunteer.findUnique({
          where: { id: input.recipientId },
          include: { shifts: true },
        });

        if (!vol) throw new Error('VOLUNTEER_NOT_FOUND');

        const hasCheckedIn = vol.shifts.some((s) => s.checkedInAt !== null);
        if (!hasCheckedIn) {
          const err = new Error('Relawan belum melakukan check-in hari ini.');
          (err as unknown as { code: string }).code = 'NOT_CHECKED_IN';
          throw err;
        }
      }

      const qty = input.quantity || 1;

      // Insert distribution
      const distribution = await tx.consumptionDistribution.create({
        data: {
          slotId: input.slotId,
          recipientType: input.recipientType,
          recipientId: input.recipientId,
          quantity: qty,
          distributedBy: actor.userId,
          clientOpId: input.clientOpId,
        },
      });

      // Update slot served_count in the same transaction
      const updatedSlot = await tx.consumptionSlot.update({
        where: { id: input.slotId },
        data: {
          servedCount: { increment: qty },
        },
      });

      await AuditLogger.log(
        {
          organizationId: actor.organizationId,
          eventId: slot.eventId,
          actorId: actor.userId,
          action: 'consumption.distributed',
          entityType: 'ConsumptionDistribution',
          entityId: distribution.id,
          after: {
            slotId: slot.id,
            recipientType: input.recipientType,
            recipientId: input.recipientId,
            quantity: qty,
          },
        },
        tx
      );

      return {
        success: true,
        distribution,
        servedCount: updatedSlot.servedCount,
      };
    });
  }
}
