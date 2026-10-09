import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { SponsorService } from '@/server/services/sponsor.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return jsonError('BAD_REQUEST', 'Parameter eventId wajib diisi', 400);
    }

    const actor = await getCurrentActor(orgSlug, eventId);
    const body = await req.json();

    if (!body.companyName || !body.packageName || !body.packageValue) {
      return jsonError('VALIDATION_ERROR', 'Nama Perusahaan, Nama Paket, dan Nilai Paket wajib diisi', 422);
    }

    const created = await SponsorService.createSponsor(actor, eventId, {
      companyName: body.companyName,
      packageName: body.packageName,
      packageValue: Number(body.packageValue),
      amountPaid: body.amountPaid ? Number(body.amountPaid) : 0,
      paymentStatus: body.paymentStatus,
      repName: body.repName,
      repEmail: body.repEmail,
    });

    return jsonSuccess(
      {
        ...created,
        packageValue: Number(created.packageValue),
        amountPaid: Number(created.amountPaid),
      },
      201
    );
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menambah sponsor', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menambah sponsor', 400);
  }
}
