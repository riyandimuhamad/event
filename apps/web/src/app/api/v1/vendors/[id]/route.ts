import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VendorService } from '@/server/services/vendor.service';
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
    const deleted = await VendorService.deleteVendor(actor, params.id);

    return jsonSuccess({ message: 'Vendor berhasil dihapus', vendor: deleted });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menghapus vendor', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menghapus vendor', 400);
  }
}
