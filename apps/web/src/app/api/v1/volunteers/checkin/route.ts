import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VolunteerService } from '@/server/services/volunteer.service';
import { CheckInVolunteerSchema } from '@eventops/shared';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    const actor = await getCurrentActor(orgSlug, eventId || undefined);
    const body = await req.json();

    const parsed = CheckInVolunteerSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', 'Input check-in tidak valid', 422, {
        errors: parsed.error.flatten(),
      });
    }

    const result = await VolunteerService.checkInVolunteer(
      actor,
      parsed.data.volunteerCode,
      parsed.data.shiftId,
      parsed.data.clientOpId
    );

    return jsonSuccess(result);
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.message === 'NOT_FOUND') {
      return jsonError('NOT_FOUND', 'Data relawan tidak ditemukan', 404);
    }
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya panitia yang berwenang mencatat check-in', 403);
    }
    return jsonError(
      error.code || 'CHECKIN_ERROR',
      error.message || 'Gagal memproses check-in',
      400
    );
  }
}
