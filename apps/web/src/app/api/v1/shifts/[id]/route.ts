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

    const actor = await getCurrentActor(orgSlug);
    const deleted = await VolunteerService.deleteShift(actor, params.id);

    return jsonSuccess({ message: 'Shift berhasil dihapus', shift: deleted });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Tidak memiliki izin untuk menghapus shift', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menghapus shift', 400);
  }
}
