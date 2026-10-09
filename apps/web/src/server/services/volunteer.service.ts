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

  public static async createVolunteer(
    actor: Actor,
    eventId: string,
    data: {
      fullName: string;
      email?: string;
      phone?: string;
      shirtSize?: string;
      divisionId?: string;
      registrationStatus?: VolunteerRegistrationStatus;
      shiftId?: string;
    }
  ) {
    if (!RbacGuard.can(actor, 'write', 'volunteer', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    // Generate next unique volunteer code
    const totalCount = await prisma.volunteer.count({
      where: { eventId },
    });
    const code = `VOL-${(totalCount + 1).toString().padStart(4, '0')}`;

    const created = await prisma.volunteer.create({
      data: {
        organizationId: actor.organizationId,
        eventId,
        code,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        shirtSize: data.shirtSize || 'L',
        divisionId: data.divisionId,
        registrationStatus: data.registrationStatus || 'APPROVED',
      },
      include: {
        division: true,
        shifts: { include: { shift: true } },
      },
    });

    if (data.shiftId) {
      await prisma.volunteerShift.create({
        data: {
          volunteerId: created.id,
          shiftId: data.shiftId,
        },
      });
    }

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'volunteer.created',
      entityType: 'Volunteer',
      entityId: created.id,
      after: { code, fullName: created.fullName, divisionId: data.divisionId },
    });

    return created;
  }

  public static async getShifts(actor: Actor, eventId: string) {
    if (!RbacGuard.can(actor, 'read', 'volunteer', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }
    return prisma.shift.findMany({
      where: { eventId },
      include: { division: true },
      orderBy: { startsAt: 'asc' },
    });
  }

  public static async updateVolunteer(
    actor: Actor,
    volunteerId: string,
    data: {
      fullName?: string;
      email?: string;
      phone?: string;
      shirtSize?: string;
      divisionId?: string | null;
      registrationStatus?: VolunteerRegistrationStatus;
      shiftId?: string | null;
    }
  ) {
    if (!RbacGuard.can(actor, 'write', 'volunteer', { organizationId: actor.organizationId })) {
      throw new Error('FORBIDDEN');
    }

    const vol = await prisma.volunteer.findFirst({
      where: withOrgScope(actor.organizationId, { id: volunteerId, deletedAt: null }),
    });

    if (!vol) throw new Error('NOT_FOUND');

    const updated = await prisma.volunteer.update({
      where: { id: vol.id },
      data: {
        fullName: data.fullName ?? vol.fullName,
        email: data.email !== undefined ? data.email : vol.email,
        phone: data.phone !== undefined ? data.phone : vol.phone,
        shirtSize: data.shirtSize ?? vol.shirtSize,
        divisionId: data.divisionId !== undefined ? data.divisionId : vol.divisionId,
        registrationStatus: data.registrationStatus ?? vol.registrationStatus,
      },
      include: {
        division: true,
        shifts: { include: { shift: true } },
      },
    });

    if (data.shiftId !== undefined) {
      if (!data.shiftId) {
        await prisma.volunteerShift.deleteMany({
          where: { volunteerId: vol.id, checkedInAt: null },
        });
      } else {
        const existingVS = await prisma.volunteerShift.findFirst({
          where: { volunteerId: vol.id },
        });
        if (existingVS) {
          await prisma.volunteerShift.update({
            where: { id: existingVS.id },
            data: { shiftId: data.shiftId },
          });
        } else {
          await prisma.volunteerShift.create({
            data: {
              volunteerId: vol.id,
              shiftId: data.shiftId,
            },
          });
        }
      }
    }

    // Refetch updated volunteer with latest shifts
    const finalVol = await prisma.volunteer.findUnique({
      where: { id: vol.id },
      include: {
        division: true,
        shifts: { include: { shift: true } },
      },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId: vol.eventId,
      actorId: actor.userId,
      action: 'volunteer.updated',
      entityType: 'Volunteer',
      entityId: vol.id,
      before: { fullName: vol.fullName, shirtSize: vol.shirtSize, divisionId: vol.divisionId, status: vol.registrationStatus },
      after: { fullName: updated.fullName, shirtSize: updated.shirtSize, divisionId: updated.divisionId, status: updated.registrationStatus },
    });

    return finalVol || updated;
  }

  public static async deleteVolunteer(actor: Actor, volunteerId: string) {
    if (!RbacGuard.can(actor, 'write', 'volunteer', { organizationId: actor.organizationId })) {
      throw new Error('FORBIDDEN');
    }

    const vol = await prisma.volunteer.findFirst({
      where: withOrgScope(actor.organizationId, { id: volunteerId, deletedAt: null }),
    });

    if (!vol) throw new Error('NOT_FOUND');

    const updated = await prisma.volunteer.update({
      where: { id: vol.id },
      data: { deletedAt: new Date() },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId: vol.eventId,
      actorId: actor.userId,
      action: 'volunteer.deleted',
      entityType: 'Volunteer',
      entityId: vol.id,
      before: { code: vol.code, fullName: vol.fullName },
    });

    return updated;
  }

  public static async bulkImportVolunteers(
    actor: Actor,
    eventId: string,
    items: Array<{
      fullName: string;
      email?: string;
      phone?: string;
      shirtSize?: string;
      divisionId?: string;
      registrationStatus?: VolunteerRegistrationStatus;
      notes?: string;
    }>
  ) {
    if (!RbacGuard.can(actor, 'write', 'volunteer', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    if (!items || items.length === 0) {
      throw new Error('Data relawan untuk diimpor tidak boleh kosong');
    }

    const startCount = await prisma.volunteer.count({
      where: { eventId },
    });

    const createdList = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const code = `VOL-${(startCount + i + 1).toString().padStart(4, '0')}`;

      const vol = await prisma.volunteer.create({
        data: {
          organizationId: actor.organizationId,
          eventId,
          code,
          fullName: item.fullName,
          email: item.email || null,
          phone: item.phone || null,
          shirtSize: item.shirtSize || 'L',
          divisionId: item.divisionId || null,
          registrationStatus: item.registrationStatus || 'PENDING',
          notes: item.notes || null,
        },
        include: {
          division: true,
        },
      });
      createdList.push(vol);
    }

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'volunteer.bulk_imported',
      entityType: 'Volunteer',
      entityId: eventId,
      after: { count: createdList.length },
    });

    return createdList;
  }
}

