import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/lib/auth/session';
import { VendorService } from '@/server/services/vendor.service';
import { jsonSuccess, jsonError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgSlug') || 'nusantara-creative';
    const eventId = searchParams.get('eventId');

    const actor = await getCurrentActor(orgSlug, eventId || undefined);
    const body = await req.json();

    if (!body.name || !body.category || !body.contactName) {
      return jsonError('VALIDATION_ERROR', 'Nama Vendor, Kategori, dan Kontak Person wajib diisi', 422);
    }

    const created = await VendorService.createVendor(actor, {
      name: body.name,
      category: body.category,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
    });

    return jsonSuccess(created, 201);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'FORBIDDEN') {
      return jsonError('FORBIDDEN', 'Hanya Manajer Acara atau Pemilik yang dapat menambah vendor', 403);
    }
    return jsonError('INTERNAL_ERROR', error.message || 'Gagal membuat vendor', 400);
  }
}
