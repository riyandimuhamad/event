import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { CommitteeService } from '@/server/services/committee.service';
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
    const deleted = await CommitteeService.deleteCommitteeMember(actor, params.id);

    return jsonSuccess({ message: 'Panitia berhasil dihapus', member: deleted });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menghapus panitia', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal menghapus panitia', 400);
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

    const updated = await CommitteeService.updateCommitteeMember(actor, params.id, {
      fullName: body.fullName,
      divisionId: body.divisionId,
      position: body.position,
      email: body.email,
      phone: body.phone,
    });

    return jsonSuccess(updated);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat mengedit hak akses panitia', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal merubah data panitia', 400);
  }
}
