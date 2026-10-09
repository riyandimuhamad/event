import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { BenefitService } from '@/server/services/benefit.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    const actor = await getCurrentActor(orgSlug, eventId || undefined);
    const body = await req.json();

    const proofFileId = body.proofFileId || crypto.randomUUID(); // Mock file ID if upload simulated

    const updated = await BenefitService.disburseFee(
      actor,
      params.id,
      proofFileId,
      body.paidAt ? new Date(body.paidAt) : undefined
    );

    return jsonSuccess(updated);
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.message === 'FORBIDDEN_DISBURSE') {
      return jsonError('FORBIDDEN', 'Hanya Owner atau Event Manager yang berwenang mencairkan benefit fee', 403);
    }
    return jsonError(
      error.code || 'DISBURSE_FAILED',
      error.message || 'Gagal memproses pencairan fee',
      400
    );
  }
}
