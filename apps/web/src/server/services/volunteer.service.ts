import { prisma, withOrgScope } from '@eventops/db';
import { Actor, RbacGuard, VolunteerRegistrationStatus } from '@eventops/shared';
import { AuditLogger } from '@/lib/audit/audit-logger';

export class VolunteerService {
  public static async getVolunteers(
    actor: Actor,
    eventId: string,
    filters?: { divisionId?: string; status?: VolunteerRegistrationStatus; search?: string }
  ) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId: actor.organizationId },
    });
    if (!event) {
      throw new Error('FORBIDDEN');
    }

    if (!RbacGuard.can(actor, 'read', 'volunteer', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const where: Record<string, unknown> = withOrgScope(actor.organizationId, {
      eventId,
      deletedAt: null,
    });

    if (filters?.divisionId) {
      where.divisionId = filters.divisionId;
    }
    if (filters?.status) {
      where.registrationStatus = filters.status;
    }
    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.volunteer.findMany({
      where,
      include: {
        division: true,
        shifts: {
          include: { shift: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  public static async updateRegistrationStatus(
    actor: Actor,
    volunteerId: string,
    status: VolunteerRegistrationStatus,
    notes?: string
  ) {
    const vol = await prisma.volunteer.findFirst({
      where: withOrgScope(actor.organizationId, { id: volunteerId, deletedAt: null }),
    });

    if (!vol) {
      throw new Error('NOT_FOUND');
    }

    // Volunteer boleh di-approve oleh Head divisi yang bersangkutan atau Event Manager/Owner
    const isHead = actor.eventRole === 'DIVISION_HEAD' && actor.divisionId === vol.divisionId;
    const isManagerOrOwner = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

    if (!isHead && !isManagerOrOwner) {
      throw new Error('FORBIDDEN');
    }

    const updated = await prisma.volunteer.update({
      where: { id: vol.id },
      data: {
        registrationStatus: status,
        reviewedBy: actor.userId,
        reviewedAt: new Date(),
        notes: notes || vol.notes,
      },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId: vol.eventId,
      actorId: actor.userId,
      action: `volunteer.status_${status.toLowerCase()}`,
      entityType: 'Volunteer',
      entityId: vol.id,
      before: { status: vol.registrationStatus },
      after: { status, notes },
    });

    return updated;
  }

  public static async checkInVolunteer(
    actor: Actor,
    volunteerCode: string,
    shiftId?: string,
    clientOpId?: string
  ) {
    if (!RbacGuard.can(actor, 'write', 'checkin', { organizationId: actor.organizationId })) {
      throw new Error('FORBIDDEN');
    }

    const vol = await prisma.volunteer.findFirst({
      where: withOrgScope(actor.organizationId, { code: volunteerCode, deletedAt: null }),
      include: {
        shifts: {
          include: { shift: true },
        },
      },
    });

    if (!vol) {
      throw new Error('NOT_FOUND');
    }

    // Rule B3: Volunteer yang REJECTED atau WITHDRAWN tidak boleh di-check-in
    if (vol.registrationStatus === 'REJECTED' || vol.registrationStatus === 'WITHDRAWN') {
      const err = new Error('Relawan berstatus DITOLAK atau MENGUNDURKAN DIRI tidak dapat melakukan check-in.');
      (err as unknown as { code: string }).code = 'VOLUNTEER_STATUS_INVALID';
      throw err;
    }

    // Check existing check-in for the same day (Rule B7)
    const existingCheckIn = vol.shifts.find((s) => s.checkedInAt !== null);
    if (existingCheckIn && existingCheckIn.checkedInAt) {
      return {
        alreadyCheckedIn: true,
        checkedInAt: existingCheckIn.checkedInAt,
        volunteer: vol,
        message: `Relawan sudah check-in pada pukul ${new Date(existingCheckIn.checkedInAt).toLocaleTimeString('id-ID')}.`,
      };
    }

    const now = new Date();

    let targetShiftRecord = shiftId
      ? vol.shifts.find((s) => s.shiftId === shiftId)
      : vol.shifts[0];

    if (!targetShiftRecord) {
      // Find or assign to default shift in this event
      const defaultShift = await prisma.shift.findFirst({
        where: { eventId: vol.eventId },
      });
      if (defaultShift) {
        targetShiftRecord = await prisma.volunteerShift.create({
          data: {
            volunteerId: vol.id,
            shiftId: defaultShift.id,
            checkedInAt: now,
            checkedInBy: actor.userId,
            status: 'CONFIRMED',
          },
          include: { shift: true },
        });
      }
    } else {
      await prisma.volunteerShift.update({
        where: { id: targetShiftRecord.id },
        data: {
          checkedInAt: now,
          checkedInBy: actor.userId,
          status: 'CONFIRMED',
        },
      });
    }

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId: vol.eventId,
      actorId: actor.userId,
      action: 'volunteer.checked_in',
      entityType: 'Volunteer',
      entityId: vol.id,
      after: { code: vol.code, checkedInAt: now, clientOpId },
    });

    return {
      alreadyCheckedIn: false,
      checkedInAt: now,
      volunteer: vol,
      message: 'Check-in berhasil.',
    };
  }
}
