import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VolunteerService } from '@/server/services/volunteer.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    const actor = await getCurrentActor(orgSlug, eventId || undefined);
    const deleted = await VolunteerService.deleteVolunteer(actor, params.id);

    return jsonSuccess({ message: 'Relawan berhasil dihapus', volunteer: deleted });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menghapus relawan', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menghapus relawan', 400);
  }
}
