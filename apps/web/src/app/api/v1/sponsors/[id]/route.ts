import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { SponsorService } from '@/server/services/sponsor.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return jsonError('BAD_REQUEST', 'Parameter eventId wajib diisi', 400);
    }

    const actor = await getCurrentActor(orgSlug, eventId);
    const deleted = await SponsorService.deleteSponsor(actor, eventId, params.id);

    return jsonSuccess({
      message: 'Sponsor berhasil dihapus',
      sponsor: {
        ...deleted,
        packageValue: Number(deleted.packageValue),
        amountPaid: Number(deleted.amountPaid),
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menghapus sponsor', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menghapus sponsor', 400);
  }
}
