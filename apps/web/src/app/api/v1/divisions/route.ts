import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { DivisionService } from '@/server/services/division.service';
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

    if (!body.name || !body.code) {
      return jsonError('VALIDATION_ERROR', 'Nama dan Kode Divisi wajib diisi', 422);
    }

    const created = await DivisionService.createDivision(actor, eventId, {
      name: body.name,
      code: body.code,
      description: body.description,
      headUserId: body.headUserId || undefined,
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menambah divisi', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal membuat divisi', 400);
  }
}
