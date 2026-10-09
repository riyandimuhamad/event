import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { EventService } from '@/server/services/event.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';

    const actor = await getCurrentActor(orgSlug);
    const body = await req.json();

    const updated = await EventService.updateEvent(actor, params.id, {
      name: body.name,
      description: body.description,
      venueName: body.venueName,
      venueAddress: body.venueAddress,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      status: body.status,
      currentPhase: body.currentPhase,
      expectedAttendees: body.expectedAttendees ? Number(body.expectedAttendees) : undefined,
    });

    return jsonSuccess({ message: 'Detail event berhasil diperbarui', event: updated });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Pemilik EO atau Manajer yang dapat mengedit event', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal mengedit detail event', 400);
  }
}
