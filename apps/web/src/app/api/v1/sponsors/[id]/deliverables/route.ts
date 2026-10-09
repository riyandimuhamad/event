import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { SponsorService } from '@/server/services/sponsor.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return jsonError('BAD_REQUEST', 'Parameter eventId wajib diisi', 400);
    }

    const actor = await getCurrentActor(orgSlug, eventId);
    const body = await req.json();

    if (!body.title) {
      return jsonError('VALIDATION_ERROR', 'Judul Deliverable wajib diisi', 422);
    }

    const created = await SponsorService.createDeliverable(actor, eventId, params.id, {
      title: body.title,
      status: body.status || 'IN_PROGRESS',
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menambah deliverable sponsor', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menambah deliverable sponsor', 400);
  }
}
