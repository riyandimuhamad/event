import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VolunteerService } from '@/server/services/volunteer.service';
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

    if (!body.volunteers || !Array.isArray(body.volunteers) || body.volunteers.length === 0) {
      return jsonError('VALIDATION_ERROR', 'Daftar relawan wajib diisi (array non-kosong)', 422);
    }

    const createdList = await VolunteerService.bulkImportVolunteers(actor, eventId, body.volunteers);

    return jsonSuccess({
      message: `Berhasil mengimpor ${createdList.length} data relawan`,
      volunteers: createdList,
    }, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat mengimpor data relawan', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal mengimpor data relawan', 400);
  }
}
