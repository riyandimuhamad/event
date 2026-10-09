import React from 'react';
import { getCurrentActor } from '@/lib/auth/session';
import { prisma, withOrgScope } from '@eventops/db';
import { VendorsClient } from '@/components/features/VendorsClient';

interface VendorsPageProps {
  params: {
    orgSlug: string;
    eventId: string;
  };
}

export default async function VendorsPage({ params }: VendorsPageProps) {
  const actor = await getCurrentActor(params.orgSlug, params.eventId);
  const rawVendors = await prisma.vendor.findMany({
    where: withOrgScope(actor.organizationId, { deletedAt: null }),
    include: {
      orders: { where: { eventId: params.eventId } },
      crews: { where: { eventId: params.eventId, status: 'ACTIVE' } },
    },
    orderBy: { name: 'asc' },
  });

  const vendors = rawVendors.map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    contactName: v.contactName,
    contactPhone: v.contactPhone,
    contactEmail: v.contactEmail,
    orders: v.orders.map((o) => ({
      id: o.id,
      description: o.description,
      amount: Number(o.amount),
      status: o.status,
    })),
    crews: v.crews.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      role: c.role,
      phone: c.phone,
      status: c.status,
    })),
  }));

  return (
    <VendorsClient
      initialVendors={vendors}
      actor={actor}
      orgSlug={params.orgSlug}
      eventId={params.eventId}
    />
  );
}
