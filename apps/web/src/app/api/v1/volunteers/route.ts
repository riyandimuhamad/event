import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VolunteerService } from '@/server/services/volunteer.service';
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

    if (!body.fullName) {
      return jsonError('VALIDATION_ERROR', 'Nama Lengkap relawan wajib diisi', 422);
    }

    const created = await VolunteerService.createVolunteer(actor, eventId, {
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      shirtSize: body.shirtSize,
      divisionId: body.divisionId || undefined,
      registrationStatus: body.registrationStatus || 'APPROVED',
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Kepala Divisi, Manajer Acara, atau Pemilik yang dapat menambah relawan', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal mendaftarkan relawan', 400);
  }
}
