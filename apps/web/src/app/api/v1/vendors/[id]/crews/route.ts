import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VendorService } from '@/server/services/vendor.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function POST(
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
    const body = await req.json();

    if (!body.fullName || !body.role) {
      return jsonError('VALIDATION_ERROR', 'Nama Kru dan Peran wajib diisi', 422);
    }

    const created = await VendorService.createVendorCrew(actor, eventId, params.id, {
      fullName: body.fullName,
      role: body.role,
      phone: body.phone,
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menambah kru vendor', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menambah kru vendor', 400);
  }
}
