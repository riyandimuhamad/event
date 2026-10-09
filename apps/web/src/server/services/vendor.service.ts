import { prisma, withOrgScope } from '@eventops/db';
import { Actor, RbacGuard } from '@eventops/shared';
import { AuditLogger } from '@/lib/audit/audit-logger';

export class VendorService {
  public static async getVendors(actor: Actor, eventId: string) {
    if (!RbacGuard.can(actor, 'read', 'vendor', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    return prisma.vendor.findMany({
      where: withOrgScope(actor.organizationId, {
        deletedAt: null,
      }),
      include: {
        orders: { where: { eventId } },
        crews: { where: { eventId, status: 'ACTIVE' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  public static async createVendor(
    actor: Actor,
    data: {
      name: string;
      category: string;
      contactName: string;
      contactPhone?: string;
      contactEmail?: string;
    }
  ) {
    if (!RbacGuard.can(actor, 'write', 'vendor', { organizationId: actor.organizationId })) {
      throw new Error('FORBIDDEN');
    }

    const created = await prisma.vendor.create({
      data: {
        organizationId: actor.organizationId,
        name: data.name,
        category: data.category.toUpperCase(),
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
      },
      include: {
        orders: true,
        crews: true,
      },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      actorId: actor.userId,
      action: 'vendor.created',
      entityType: 'Vendor',
      entityId: created.id,
      after: { name: created.name, category: created.category },
    });

    return created;
  }

  public static async createVendorCrew(
    actor: Actor,
    eventId: string,
    vendorId: string,
    data: {
      fullName: string;
      role: string;
      phone?: string;
    }
  ) {
    if (!RbacGuard.can(actor, 'write', 'vendor', { organizationId: actor.organizationId, eventId })) {
      throw new Error('FORBIDDEN');
    }

    const created = await prisma.vendorCrew.create({
      data: {
        eventId,
        vendorId,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone,
        status: 'ACTIVE',
      },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      eventId,
      actorId: actor.userId,
      action: 'vendor_crew.created',
      entityType: 'VendorCrew',
      entityId: created.id,
      after: { fullName: created.fullName, vendorId, role: created.role },
    });

    return created;
  }

  public static async deleteVendor(actor: Actor, vendorId: string) {
    if (!RbacGuard.can(actor, 'write', 'vendor', { organizationId: actor.organizationId })) {
      throw new Error('FORBIDDEN');
    }

    const vendor = await prisma.vendor.findFirst({
      where: withOrgScope(actor.organizationId, { id: vendorId, deletedAt: null }),
    });

    if (!vendor) throw new Error('NOT_FOUND');

    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: { deletedAt: new Date() },
    });

    await AuditLogger.log({
      organizationId: actor.organizationId,
      actorId: actor.userId,
      action: 'vendor.deleted',
      entityType: 'Vendor',
      entityId: vendor.id,
      before: { name: vendor.name },
    });

    return updated;
  }
}
