import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@eventops/db';
import { RequisitionService } from './requisition.service';
import { VolunteerService } from './volunteer.service';
import { ConsumptionService } from './consumption.service';
import { BenefitService } from './benefit.service';
import { Actor } from '@eventops/shared';

describe('EventOps Domain Services Integration Tests', () => {
  let orgId: string;
  let eventId: string;
  let divAcaraId: string;
  let divLogistikId: string;
  let divKonsumsiId: string;

  let ownerActor: Actor;
  let headAcaraActor: Actor;
  let headLogistikActor: Actor;
  let headKonsumsiActor: Actor;
  let volunteerActor: Actor;

  beforeAll(async () => {
    const org = await prisma.organization.findUnique({
      where: { slug: 'nusantara-creative' },
    });
    if (!org) throw new Error('Database not seeded');
    orgId = org.id;

    const event = await prisma.event.findFirst({
      where: { organizationId: orgId, slug: 'fmn-2026' },
      include: { divisions: true },
    });
    if (!event) throw new Error('Event not seeded');
    eventId = event.id;

    const divAcara = event.divisions.find((d) => d.code === 'ACR')!;
    const divLogistik = event.divisions.find((d) => d.code === 'LOG')!;
    const divKonsumsi = event.divisions.find((d) => d.code === 'KSM')!;

    divAcaraId = divAcara.id;
    divLogistikId = divLogistik.id;
    divKonsumsiId = divKonsumsi.id;

    const ownerUser = await prisma.user.findUnique({ where: { email: 'owner@eventops.local' } });
    const headAcaraUser = await prisma.user.findUnique({ where: { email: 'head.acara@eventops.local' } });
    const headLogistikUser = await prisma.user.findUnique({ where: { email: 'head.logistik@eventops.local' } });
    const headKonsumsiUser = await prisma.user.findUnique({ where: { email: 'head.konsumsi@eventops.local' } });
    const volunteerUser = await prisma.user.findUnique({ where: { email: 'volunteer@eventops.local' } });

    ownerActor = {
      userId: ownerUser!.id,
      organizationId: orgId,
      orgRole: 'OWNER',
      eventId,
      eventRole: 'OWNER',
    };

    headAcaraActor = {
      userId: headAcaraUser!.id,
      organizationId: orgId,
      orgRole: 'MEMBER',
      eventId,
      eventRole: 'DIVISION_HEAD',
      divisionId: divAcaraId,
    };

    headLogistikActor = {
      userId: headLogistikUser!.id,
      organizationId: orgId,
      orgRole: 'MEMBER',
      eventId,
      eventRole: 'DIVISION_HEAD',
      divisionId: divLogistikId,
    };

    headKonsumsiActor = {
      userId: headKonsumsiUser!.id,
      organizationId: orgId,
      orgRole: 'MEMBER',
      eventId,
      eventRole: 'DIVISION_HEAD',
      divisionId: divKonsumsiId,
    };

    volunteerActor = {
      userId: volunteerUser!.id,
      organizationId: orgId,
      orgRole: 'MEMBER',
      eventId,
      eventRole: 'VOLUNTEER',
      divisionId: divAcaraId,
    };
  });

  describe('RequisitionService', () => {
    it('creates a new requisition in DRAFT status and writes audit log', async () => {
      const created = await RequisitionService.createRequisition(
        headAcaraActor,
        eventId,
        {
          title: 'Kebutuhan Kabel Roll 50m untuk Area Sound',
          fromDivisionId: divAcaraId,
          toDivisionId: divLogistikId,
          priority: 'MEDIUM',
          items: [{ name: 'Kabel Roll 50 Meter', quantity: 4, unit: 'rol' }],
        },
        false
      );

      expect(created.id).toBeDefined();
      expect(created.status).toBe('DRAFT');
      expect(created.code).toMatch(/^REQ-/);

      // Verify audit log
      const audit = await prisma.auditLog.findFirst({
        where: { entityType: 'Requisition', entityId: created.id },
      });
      expect(audit).toBeDefined();
      expect(audit?.action).toBe('requisition.created');
    });

    it('requires reject reason to have at least 10 characters', async () => {
      const created = await RequisitionService.createRequisition(
        headAcaraActor,
        eventId,
        {
          title: 'Kebutuhan Tenda Tambahan',
          fromDivisionId: divAcaraId,
          toDivisionId: divLogistikId,
          priority: 'HIGH',
          items: [{ name: 'Tenda Sarnafil', quantity: 2, unit: 'unit' }],
        },
        true // Directly SUBMITTED
      );

      // Reject with short reason fails
      await expect(
        RequisitionService.transitionStatus(headLogistikActor, created.id, 'REJECTED', 'batal')
      ).rejects.toThrow();

      // Reject with valid reason succeeds
      const rejected = await RequisitionService.transitionStatus(
        headLogistikActor,
        created.id,
        'REJECTED',
        'Stok tenda sudah habis teralokasikan untuk area registrasi.'
      );
      expect(rejected.status).toBe('REJECTED');
    });

    it('follows full lifecycle: SUBMITTED -> APPROVED -> IN_PROGRESS -> FULFILLED -> CLOSED', async () => {
      const req = await RequisitionService.createRequisition(
        headAcaraActor,
        eventId,
        {
          title: 'Kursi Lipat VIP 20 Pcs',
          fromDivisionId: divAcaraId,
          toDivisionId: divLogistikId,
          priority: 'LOW',
          items: [{ name: 'Kursi Chitose', quantity: 20, unit: 'buah' }],
        },
        true // SUBMITTED
      );

      const approved = await RequisitionService.transitionStatus(headLogistikActor, req.id, 'APPROVED');
      expect(approved.status).toBe('APPROVED');

      const inProgress = await RequisitionService.transitionStatus(headLogistikActor, req.id, 'IN_PROGRESS');
      expect(inProgress.status).toBe('IN_PROGRESS');

      const fulfilled = await RequisitionService.transitionStatus(headLogistikActor, req.id, 'FULFILLED');
      expect(fulfilled.status).toBe('FULFILLED');

      const closed = await RequisitionService.transitionStatus(headAcaraActor, req.id, 'CLOSED');
      expect(closed.status).toBe('CLOSED');
    });
  });

  describe('VolunteerService', () => {
    it('checks in approved volunteer and prevents duplicate check-in on the same day', async () => {
      // Pick an approved volunteer
      const vol = await prisma.volunteer.findFirst({
        where: { eventId, registrationStatus: 'APPROVED' },
      });
      expect(vol).toBeDefined();

      const firstCheckIn = await VolunteerService.checkInVolunteer(ownerActor, vol!.code);
      expect(firstCheckIn.volunteer).toBeDefined();

      // Second check-in should show warning with existing checkin time
      const secondCheckIn = await VolunteerService.checkInVolunteer(ownerActor, vol!.code);
      expect(secondCheckIn.alreadyCheckedIn).toBe(true);
      expect(secondCheckIn.message).toContain('sudah check-in');
    });

    it('rejects check-in for REJECTED volunteer', async () => {
      const rejectedVol = await prisma.volunteer.findFirst({
        where: { eventId, registrationStatus: 'REJECTED' },
      });
      if (rejectedVol) {
        await expect(
          VolunteerService.checkInVolunteer(ownerActor, rejectedVol.code)
        ).rejects.toThrow('DITOLAK');
      }
    });
  });

  describe('ConsumptionService', () => {
    it('prevents meal distribution if volunteer has not checked in', async () => {
      const slot = await prisma.consumptionSlot.findFirst({
        where: { eventId, status: 'OPEN' },
      });
      expect(slot).toBeDefined();

      // Create dummy un-checked-in volunteer
      const unCheckedVol = await prisma.volunteer.create({
        data: {
          organizationId: orgId,
          eventId,
          code: `VOL-TEST-${Date.now().toString().slice(-4)}`,
          fullName: 'Test Unchecked Vol',
          registrationStatus: 'APPROVED',
        },
      });

      await expect(
        ConsumptionService.distributeMeal(headKonsumsiActor, {
          slotId: slot!.id,
          recipientType: 'VOLUNTEER',
          recipientId: unCheckedVol.id,
        })
      ).rejects.toThrow('belum melakukan check-in');
    });

    it('distributes meal to checked-in recipient and rejects duplicate distribution', async () => {
      const slot = await prisma.consumptionSlot.findFirst({
        where: { eventId, status: 'OPEN', label: 'Sarapan Pagi Hari 1' },
      });
      expect(slot).toBeDefined();

      // Find and check in an approved volunteer
      const testVol = await prisma.volunteer.findFirst({
        where: { eventId, registrationStatus: 'APPROVED' },
      });
      expect(testVol).toBeDefined();
      await VolunteerService.checkInVolunteer(ownerActor, testVol!.code);
      const vol = testVol!;

      // Delete existing distribution for this test slot if any
      await prisma.consumptionDistribution.deleteMany({
        where: { slotId: slot!.id, recipientId: vol.id },
      });

      const initialServed = (await prisma.consumptionSlot.findUnique({ where: { id: slot!.id } }))!.servedCount;

      const res = await ConsumptionService.distributeMeal(headKonsumsiActor, {
        slotId: slot!.id,
        recipientType: 'VOLUNTEER',
        recipientId: vol.id,
        quantity: 1,
      });

      expect(res.success).toBe(true);
      expect(res.servedCount).toBe(initialServed + 1);

      // Attempt second distribution to same person on same slot -> MUST reject ALREADY_SERVED
      await expect(
        ConsumptionService.distributeMeal(headKonsumsiActor, {
          slotId: slot!.id,
          recipientType: 'VOLUNTEER',
          recipientId: vol.id,
          quantity: 1,
        })
      ).rejects.toThrow('Penerima sudah mendapatkan makanan');
    });

    it('handles idempotent distribution with clientOpId', async () => {
      const slot = await prisma.consumptionSlot.findFirst({
        where: { eventId, status: 'OPEN' },
      });
      const clientOpId = crypto.randomUUID();

      // Test with volunteer crew (who does not require volunteer shift check-in)
      const crew = await prisma.vendorCrew.findFirst({ where: { eventId } });
      expect(crew).toBeDefined();

      // Clean up if already exists
      await prisma.consumptionDistribution.deleteMany({
        where: { slotId: slot!.id, recipientId: crew!.id },
      });

      const firstCall = await ConsumptionService.distributeMeal(headKonsumsiActor, {
        slotId: slot!.id,
        recipientType: 'VENDOR_CREW',
        recipientId: crew!.id,
        clientOpId,
      });
      expect(firstCall.success).toBe(true);

      // Second call with same clientOpId returns idempotently without error
      const secondCall = await ConsumptionService.distributeMeal(headKonsumsiActor, {
        slotId: slot!.id,
        recipientType: 'VENDOR_CREW',
        recipientId: crew!.id,
        clientOpId,
      });
      expect(secondCall.idempotent).toBe(true);
    });
  });

  describe('BenefitService', () => {
    it('disburses fee with proofFileId by Owner/Manager and writes audit log', async () => {
      const benefit = await prisma.benefit.findFirst({
        where: { eventId, kind: 'FEE', status: 'UNPAID' },
      });

      if (benefit) {
        const proofFileId = crypto.randomUUID();
        const disbursed = await BenefitService.disburseFee(
          ownerActor,
          benefit.id,
          proofFileId
        );
        expect(disbursed.status).toBe('PAID');
        expect(disbursed.proofFileId).toBe(proofFileId);

        // Audit log written
        const audit = await prisma.auditLog.findFirst({
          where: { entityType: 'Benefit', entityId: benefit.id, action: 'benefit.disbursed' },
        });
        expect(audit).toBeDefined();
      }
    });

    it('rejects fee disbursement by non-owner non-manager (e.g. Volunteer or Division Head)', async () => {
      const benefit = await prisma.benefit.findFirst({
        where: { eventId, kind: 'FEE' },
      });

      if (benefit) {
        await expect(
          BenefitService.disburseFee(headAcaraActor, benefit.id, crypto.randomUUID())
        ).rejects.toThrow();

        await expect(
          BenefitService.disburseFee(volunteerActor, benefit.id, crypto.randomUUID())
        ).rejects.toThrow();
      }
    });
  });

  describe('Tenant Isolation (Rule C1)', () => {
    it('strictly forbids actor from another tenant organization', async () => {
      const foreignActor: Actor = {
        userId: 'user-foreign',
        organizationId: '00000000-0000-0000-0000-000000000099',
        orgRole: 'OWNER',
        eventId,
      };

      await expect(
        RequisitionService.getRequisitions(foreignActor, eventId)
      ).rejects.toThrow('FORBIDDEN');

      await expect(
        VolunteerService.getVolunteers(foreignActor, eventId)
      ).rejects.toThrow('FORBIDDEN');

      await expect(
        ConsumptionService.getSlots(foreignActor, eventId)
      ).rejects.toThrow('FORBIDDEN');

      await expect(
        BenefitService.getBenefits(foreignActor, eventId)
      ).rejects.toThrow('FORBIDDEN');
    });
  });
});
