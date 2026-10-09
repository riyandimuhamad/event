import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VolunteerService } from '@/server/services/volunteer.service';
import { ConsumptionService } from '@/server/services/consumption.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export interface OfflineOperation {
  clientOpId: string;
  clientTimestamp: string;
  type: 'CHECK_IN' | 'CONSUMPTION_DISTRIBUTION';
  payload: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    const actor = await getCurrentActor(orgSlug, eventId || undefined);
    const body = await req.json();

    const operations: OfflineOperation[] = body.operations || [];

    // Sort by clientTimestamp
    operations.sort(
      (a, b) => new Date(a.clientTimestamp).getTime() - new Date(b.clientTimestamp).getTime()
    );

    const results = [];

    for (const op of operations) {
      try {
        if (op.type === 'CHECK_IN') {
          const res = await VolunteerService.checkInVolunteer(
            actor,
            op.payload.volunteerCode as string,
            op.payload.shiftId as string | undefined,
            op.clientOpId
          );
          results.push({
            clientOpId: op.clientOpId,
            status: 'SUCCESS',
            data: res,
          });
        } else if (op.type === 'CONSUMPTION_DISTRIBUTION') {
          const res = await ConsumptionService.distributeMeal(actor, {
            slotId: op.payload.slotId as string,
            recipientType: op.payload.recipientType as any,
            recipientId: op.payload.recipientId as string,
            quantity: (op.payload.quantity as number) || 1,
            clientOpId: op.clientOpId,
          });
          results.push({
            clientOpId: op.clientOpId,
            status: 'SUCCESS',
            data: res,
          });
        } else {
          results.push({
            clientOpId: op.clientOpId,
            status: 'REJECTED',
            error: 'Unsupported operation type',
          });
        }
      } catch (opErr: unknown) {
        const error = opErr as Error & { code?: string };
        results.push({
          clientOpId: op.clientOpId,
          status: 'REJECTED',
          error: error.message,
          code: error.code || 'SYNC_ERROR',
        });
      }
    }

    return jsonSuccess({
      totalProcessed: operations.length,
      results,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal memproses sinkronisasi', 500);
  }
}
