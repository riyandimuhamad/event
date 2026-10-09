import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VolunteerService } from '@/server/services/volunteer.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return jsonError('BAD_REQUEST', 'Parameter eventId wajib diisi', 400);
    }

    const actor = await getCurrentActor(orgSlug, eventId);
    const shifts = await VolunteerService.getShifts(actor, eventId);

    return jsonSuccess(shifts);
  } catch (err: unknown) {
    const error = err as Error;
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal mengambil daftar shift', 400);
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

    if (!body.name || !body.startsAt || !body.endsAt) {
      return jsonError('VALIDATION_ERROR', 'Nama shift, waktu mulai, dan waktu selesai wajib diisi', 422);
    }

    const created = await VolunteerService.createShift(actor, eventId, {
      name: body.name,
      divisionId: body.divisionId,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      capacity: body.capacity ? Number(body.capacity) : undefined,
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Tidak memiliki izin untuk menambah shift', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal membuat shift', 400);
  }
}
