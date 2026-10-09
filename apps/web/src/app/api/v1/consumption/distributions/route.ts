import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { ConsumptionService } from '@/server/services/consumption.service';
import { DistributeConsumptionSchema } from '@eventops/shared';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    const actor = await getCurrentActor(orgSlug, eventId || undefined);
    const body = await req.json();

    const parsed = DistributeConsumptionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', 'Input distribusi makanan tidak valid', 422, {
        errors: parsed.error.flatten(),
      });
    }

    const result = await ConsumptionService.distributeMeal(actor, {
      slotId: parsed.data.slotId,
      recipientType: parsed.data.recipientType,
      recipientId: parsed.data.recipientId,
      quantity: parsed.data.quantity,
      clientOpId: parsed.data.clientOpId,
    });

    return jsonSuccess(result, 201);
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya petugas konsumsi yang berwenang mendistribusikan konsumsi', 403);
    }
    return jsonError(
      error.code || 'DISTRIBUTION_FAILED',
      error.message || 'Gagal memproses distribusi makan',
      400
    );
  }
}
