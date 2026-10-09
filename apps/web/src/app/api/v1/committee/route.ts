import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { CommitteeService } from '@/server/services/committee.service';
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

    if (!body.fullName || !body.divisionId) {
      return jsonError('VALIDATION_ERROR', 'Nama Lengkap dan Divisi wajib diisi', 422);
    }

    const created = await CommitteeService.createCommitteeMember(actor, eventId, {
      divisionId: body.divisionId,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      position: body.position,
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menambah panitia', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menambah panitia', 400);
  }
}
