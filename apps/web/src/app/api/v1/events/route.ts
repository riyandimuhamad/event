import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { EventService } from '@/server/services/event.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';

    const actor = await getCurrentActor(orgSlug);
    const events = await EventService.getEvents(actor);

    return jsonSuccess(events);
  } catch (err: unknown) {
    const error = err as Error;
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal mengambil daftar event', 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';

    const actor = await getCurrentActor(orgSlug);
    const body = await req.json();

    if (!body.name || !body.startsAt || !body.endsAt) {
      return jsonError('VALIDATION_ERROR', 'Nama event, tanggal mulai, dan tanggal selesai wajib diisi', 422);
    }

    const created = await EventService.createEvent(actor, {
      name: body.name,
      slug: body.slug,
      description: body.description,
      venueName: body.venueName,
      venueAddress: body.venueAddress,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      expectedAttendees: body.expectedAttendees ? Number(body.expectedAttendees) : undefined,
      currentPhase: body.currentPhase,
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Pemilik EO atau Manajer yang dapat membuat event baru', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal membuat event baru', 400);
  }
}
