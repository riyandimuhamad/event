import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { TalentService } from '@/server/services/talent.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

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

    if (!body.name || !body.category) {
      return jsonError('VALIDATION_ERROR', 'Nama Talent dan Kategori wajib diisi', 422);
    }

    const created = await TalentService.createTalent(actor, eventId, {
      name: body.name,
      category: body.category,
      managementName: body.managementName,
      managementContact: body.managementContact,
      managementEmail: body.managementEmail,
      riderNotes: body.riderNotes,
      fee: body.fee ? Number(body.fee) : undefined,
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menambah talent', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menambah talent', 400);
  }
}
