import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { TalentService } from '@/server/services/talent.service';
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

    if (!body.stageName || !body.startsAt || !body.endsAt) {
      return jsonError('VALIDATION_ERROR', 'Nama Panggung, Jam Mulai, dan Jam Selesai wajib diisi', 422);
    }

    const created = await TalentService.createTalentShow(actor, eventId, params.id, {
      stageName: body.stageName,
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt),
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menambah jadwal pertunjukan', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menambah jadwal pertunjukan', 400);
  }
}
