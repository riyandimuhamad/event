import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { RequisitionService } from '@/server/services/requisition.service';
import { TransitionRequisitionSchema } from '@eventops/shared';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    const actor = await getCurrentActor(orgSlug, eventId || undefined);
    const body = await req.json();

    const parsed = TransitionRequisitionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', 'Input transisi tidak valid', 422, {
        errors: parsed.error.flatten(),
      });
    }

    const updated = await RequisitionService.transitionStatus(
      actor,
      params.id,
      parsed.data.to,
      parsed.data.reason
    );

    return jsonSuccess(updated);
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.message === 'NOT_FOUND') {
      return jsonError('NOT_FOUND', 'Kebutuhan tidak ditemukan', 404);
    }
    return jsonError(
      error.code || 'TRANSITION_FAILED',
      error.message || 'Gagal mengubah status kebutuhan',
      400
    );
  }
}
