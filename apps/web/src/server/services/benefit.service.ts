import { prisma } from '@eventops/db';
import { Actor, RbacGuard, BenefitFeeStatus, BenefitCertificateStatus } from '@eventops/shared';
import { AuditLogger } from '@/lib/audit/audit-logger';

export class BenefitService {
  public static async getBenefits(actor: Actor, eventId: string) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId: actor.organizationId },
    });
    if (!event) {
      throw new Error('FORBIDDEN');
    }

    if (!RbacGuard.can(actor, 'read', 'benefit', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const benefits = await prisma.benefit.findMany({
      where: { eventId },
      include: {
        events: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { id: 'asc' },
    });

    // Resolve recipient names
    const volunteerIds = benefits.filter((b) => b.recipientType === 'VOLUNTEER').map((b) => b.recipientId);
    const volunteers = await prisma.volunteer.findMany({
      where: { id: { in: volunteerIds } },
      include: { division: true },
    });
    const volMap = new Map(volunteers.map((v) => [v.id, v]));

    return benefits.map((b) => {
      const vol = volMap.get(b.recipientId);
      return {
        ...b,
        recipientName: vol?.fullName || 'Penerima',
        recipientDivision: vol?.division?.name || '-',
        amountNumber: b.amount ? Number(b.amount) : 0,
      };
    });
  }

  public static async disburseFee(
    actor: Actor,
    benefitId: string,
    proofFileId: string,
    paidAt?: Date
  ) {
    // Only Owner and Event Manager can disburse benefits per rules.md C2 & B8
    const canDisburse = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';
    if (!canDisburse) {
      throw new Error('FORBIDDEN_DISBURSE');
    }

    const benefit = await prisma.benefit.findUnique({
      where: { id: benefitId },
    });

    if (!benefit || benefit.kind !== 'FEE') {
      throw new Error('BENEFIT_NOT_FOUND');
    }

    if (benefit.status === 'PAID') {
      throw new Error('ALREADY_PAID');
    }

    // Rule B8: Status PAID wajib menyertakan proof_file_id dan paid_at
    if (!proofFileId) {
      const err = new Error('Pencairan fee wajib menyertakan file bukti transfer.');
      (err as unknown as { code: string }).code = 'PROOF_FILE_REQUIRED';
      throw err;
    }

    const paymentDate = paidAt || new Date();

    return prisma.$transaction(async (tx) => {
      const updated = await tx.benefit.update({
        where: { id: benefitId },
        data: {
          status: 'PAID' as BenefitFeeStatus,
          proofFileId,
          paidAt: paymentDate,
        },
      });

      await tx.benefitEvent.create({
        data: {
          benefitId,
          fromStatus: benefit.status,
          toStatus: 'PAID',
          actorId: actor.userId,
          note: 'Pencairan fee telah diverifikasi dengan bukti transfer.',
        },
      });

      await AuditLogger.log(
        {
          organizationId: actor.organizationId,
          eventId: benefit.eventId,
          actorId: actor.userId,
          action: 'benefit.disbursed',
          entityType: 'Benefit',
          entityId: benefit.id,
          before: { status: benefit.status },
          after: { status: 'PAID', proofFileId, paidAt: paymentDate },
        },
        tx
      );

      return updated;
    });
  }

  public static async updateCertificateStatus(
    actor: Actor,
    benefitId: string,
    status: BenefitCertificateStatus
  ) {
    if (!RbacGuard.can(actor, 'write', 'benefit', { organizationId: actor.organizationId })) {
      throw new Error('FORBIDDEN');
    }

    const benefit = await prisma.benefit.findUnique({
      where: { id: benefitId },
    });

    if (!benefit || benefit.kind !== 'CERTIFICATE') {
      throw new Error('BENEFIT_NOT_FOUND');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.benefit.update({
        where: { id: benefitId },
        data: { status },
      });

      await tx.benefitEvent.create({
        data: {
          benefitId,
          fromStatus: benefit.status,
          toStatus: status,
          actorId: actor.userId,
          note: `Status sertifikat diubah menjadi ${status}`,
        },
      });

      await AuditLogger.log(
        {
          organizationId: actor.organizationId,
          eventId: benefit.eventId,
          actorId: actor.userId,
          action: `benefit.certificate_${status.toLowerCase()}`,
          entityType: 'Benefit',
          entityId: benefit.id,
          before: { status: benefit.status },
          after: { status },
        },
        tx
      );

      return updated;
    });
  }
}
