import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VolunteerService } from '@/server/services/volunteer.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    const actor = await getCurrentActor(orgSlug, eventId || undefined);
    const body = await req.json();

    const updated = await VolunteerService.updateRegistrationStatus(
      actor,
      params.id,
      body.status,
      body.notes
    );

    return jsonSuccess(updated);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Kepala Divisi atau Event Manager yang dapat menyetujui relawan', 403);
    }
    return jsonError('UPDATE_FAILED', error.message || 'Gagal mengubah status relawan', 400);
  }
}
