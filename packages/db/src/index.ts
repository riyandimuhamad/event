import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Tenant scoping helper ensuring all tenant queries are filtered strictly by organization_id
 */
export function withOrgScope<T extends Record<string, unknown> = Record<string, unknown>>(
  orgId: string,
  filter?: T
): T & { organizationId: string } {
  return Object.assign({}, filter, {
    organizationId: orgId,
  }) as T & { organizationId: string };
}

export * from '@prisma/client';
