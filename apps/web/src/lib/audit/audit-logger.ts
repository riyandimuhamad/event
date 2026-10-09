import { prisma } from '@eventops/db';
import { Prisma } from '@prisma/client';

export interface AuditLogEntry {
  organizationId: string;
  eventId?: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
}

// Sensitive fields to strip/mask from audit logs per rules.md C6 & architecture.md 11
const SENSITIVE_FIELDS = ['phone', 'email', 'nationalId', 'password', 'token', 'nationalIdEncrypted'];

function sanitizeAuditPayload(data?: Record<string, unknown> | null): Prisma.InputJsonValue | undefined {
  if (!data) return undefined;
  const sanitized = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      sanitized[field] = '***MASKED***';
    }
  }
  return sanitized as Prisma.InputJsonValue;
}

export class AuditLogger {
  public static async log(entry: AuditLogEntry, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.auditLog.create({
      data: {
        organizationId: entry.organizationId,
        eventId: entry.eventId,
        actorId: entry.actorId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        before: sanitizeAuditPayload(entry.before),
        after: sanitizeAuditPayload(entry.after),
        ip: entry.ip,
        userAgent: entry.userAgent,
      },
    });
  }
}
