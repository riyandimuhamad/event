import { z } from 'zod';

export const CreateOrganizationSchema = z.object({
  name: z.string().min(3, 'Nama organisasi minimal 3 karakter'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
  description: z.string().optional(),
});

export const CreateEventSchema = z.object({
  name: z.string().min(3, 'Nama event minimal 3 karakter'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
  description: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  startsAt: z.string().or(z.date()),
  endsAt: z.string().or(z.date()),
  expectedAttendees: z.number().int().positive().optional(),
}).refine(
  (data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(),
  {
    message: 'Waktu selesai harus setelah waktu mulai',
    path: ['endsAt'],
  }
);

export const CreateDivisionSchema = z.object({
  name: z.string().min(2, 'Nama divisi minimal 2 karakter'),
  code: z.string().min(2).max(10, 'Kode divisi 2-10 karakter').toUpperCase(),
  description: z.string().optional(),
  headUserId: z.string().uuid().optional(),
});

export const CreateRequisitionItemSchema = z.object({
  name: z.string().min(2, 'Nama item minimal 2 karakter'),
  quantity: z.number().positive('Jumlah harus lebih dari 0'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  notes: z.string().optional(),
});

export const CreateRequisitionSchema = z.object({
  title: z.string().min(3, 'Judul kebutuhan minimal 3 karakter'),
  description: z.string().optional(),
  fromDivisionId: z.string().uuid(),
  toDivisionId: z.string().uuid(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  neededBy: z.string().or(z.date()).optional(),
  items: z.array(CreateRequisitionItemSchema).min(1, 'Minimal 1 item kebutuhan'),
}).refine(
  (data) => data.fromDivisionId !== data.toDivisionId,
  {
    message: 'Divisi pembuat dan divisi tujuan tidak boleh sama',
    path: ['toDivisionId'],
  }
);

export const TransitionRequisitionSchema = z.object({
  to: z.enum([
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'IN_PROGRESS',
    'FULFILLED',
    'CLOSED',
  ]),
  reason: z.string().optional(),
});

export const CreateVolunteerSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Format email tidak valid').optional(),
  phone: z.string().min(8, 'Nomor HP minimal 8 karakter').optional(),
  nationalId: z.string().min(10, 'Nomor identitas minimal 10 karakter').optional(),
  shirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']).optional(),
  divisionId: z.string().uuid().optional(),
});

export const CheckInVolunteerSchema = z.object({
  volunteerCode: z.string().min(3, 'Kode volunteer wajib diisi'),
  shiftId: z.string().uuid().optional(),
  clientOpId: z.string().uuid().optional(),
  clientTimestamp: z.string().or(z.date()).optional(),
});

export const DistributeConsumptionSchema = z.object({
  slotId: z.string().uuid(),
  recipientType: z.enum(['VOLUNTEER', 'COMMITTEE', 'VENDOR_CREW', 'TALENT', 'SPONSOR']),
  recipientId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  clientOpId: z.string().uuid().optional(),
  clientTimestamp: z.string().or(z.date()).optional(),
});

export const DisburseBenefitSchema = z.object({
  benefitId: z.string().uuid(),
  proofFileId: z.string().uuid('Bukti transfer wajib diunggah'),
  paidAt: z.string().or(z.date()).optional(),
});
