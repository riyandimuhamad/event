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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    const actor = await getCurrentActor(orgSlug, eventId || undefined);
    const body = await req.json();

    const updated = await VolunteerService.updateVolunteer(actor, params.id, {
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      shirtSize: body.shirtSize,
      divisionId: body.divisionId,
      registrationStatus: body.registrationStatus,
    });

    return jsonSuccess({ message: 'Data volunteer berhasil diperbarui', volunteer: updated });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Tidak memiliki izin untuk mengubah data volunteer', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal memperbarui data volunteer', 400);
  }
}
