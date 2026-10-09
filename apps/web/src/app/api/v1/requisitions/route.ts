import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { RequisitionService } from '@/server/services/requisition.service';
import { CreateRequisitionSchema } from '@eventops/shared';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');
    const type = (searchParams.get('type') || 'all') as 'incoming' | 'outgoing' | 'all';

    if (!eventId) {
      return jsonError('BAD_REQUEST', 'Parameter eventId wajib diisi', 400);
    }

    const actor = await getCurrentActor(orgSlug, eventId);
    const requisitions = await RequisitionService.getRequisitions(actor, eventId, type);
    return jsonSuccess(requisitions);
  } catch (err: unknown) {
    const error = err as Error;
    return jsonError('INTERNAL_ERROR', error.message || 'Terjadi kesalahan sistem', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return jsonError('BAD_REQUEST', 'Parameter eventId wajib diisi', 400);
    }

    const actor = await getCurrentActor(orgSlug, eventId);
    const body = await req.json();

    const parsed = CreateRequisitionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', 'Input tidak valid', 422, {
        errors: parsed.error.flatten(),
      });
    }

    const submitImmediately = body.submitImmediately ?? false;
    const created = await RequisitionService.createRequisition(
      actor,
      eventId,
      {
        ...parsed.data,
        neededBy: parsed.data.neededBy ? new Date(parsed.data.neededBy) : undefined,
      },
      submitImmediately
    );

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Anda tidak memiliki hak akses untuk tindakan ini', 403);
    }
    return jsonError(error.code || 'INTERNAL_ERROR', error.message || 'Terjadi kesalahan sistem', 400);
  }
}
