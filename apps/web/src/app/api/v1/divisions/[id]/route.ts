import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { DivisionService } from '@/server/services/division.service';
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
    const deleted = await DivisionService.softDeleteDivision(actor, params.id);

    return jsonSuccess({ message: 'Divisi berhasil dihapus', division: deleted });
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.code === 'DIVISION_HAS_ACTIVE_DEPENDENCIES') {
      return jsonError('DIVISION_HAS_ACTIVE_DEPENDENCIES', error.message, 409);
    }
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menghapus divisi', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menghapus divisi', 400);
  }
}
