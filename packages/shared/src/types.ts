// Core domain types for EventOps

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type EventRole =
  | 'OWNER'
  | 'EVENT_MANAGER'
  | 'DIVISION_HEAD'
  | 'COMMITTEE'
  | 'VOLUNTEER'
  | 'TALENT_MANAGER'
  | 'SPONSOR_REP'
  | 'VENDOR_ADMIN'
  | 'VENDOR_CREW';

export type EventStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type EventPhase = 'PRE_EVENT' | 'DAY_OF' | 'POST_EVENT' | 'CLOSED';

export type DivisionMemberRole = 'HEAD' | 'MEMBER';

export type CommitteeEmploymentType = 'VOLUNTEER_COMMITTEE' | 'PAID' | 'CONTRACT';
export type CommitteeAgreementStatus = 'DRAFT' | 'SIGNED' | 'TERMINATED';

export type VolunteerRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

export type VolunteerShiftStatus =
  | 'ASSIGNED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'COMPLETED';

export type ShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

export type InventoryCategory =
  | 'SHIRT'
  | 'ID_CARD'
  | 'LANYARD'
  | 'WRISTBAND'
  | 'CERTIFICATE'
  | 'OTHER';

export type InventoryDistributionStatus = 'PENDING' | 'TAKEN' | 'CANCELLED';

export type RecipientType =
  | 'VOLUNTEER'
  | 'COMMITTEE'
  | 'VENDOR_CREW'
  | 'TALENT'
  | 'SPONSOR';

export type PrintJobType = 'ID_CARD' | 'CERTIFICATE' | 'LABEL';
export type PrintJobStatus = 'QUEUED' | 'PRINTED' | 'FAILED';

export type RequisitionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RequisitionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'FULFILLED'
  | 'CLOSED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type VendorCategory =
  | 'CATERING'
  | 'SOUND'
  | 'DECORATION'
  | 'EQUIPMENT'
  | 'SECURITY'
  | 'OTHER';

export type VendorOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'DELIVERED'
  | 'PAID'
  | 'CANCELLED';

export type VendorCrewStatus = 'ACTIVE' | 'REMOVED';

export type TalentContractStatus = 'DRAFT' | 'SIGNED' | 'CANCELLED';
export type TalentShowStatus = 'SCHEDULED' | 'SOUNDCHECK' | 'PERFORMED' | 'CANCELLED';
export type CommunicationChannel = 'EMAIL' | 'PHONE' | 'WHATSAPP' | 'IN_PERSON';

export type SponsorPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type SponsorDeliverableStatus = 'PENDING' | 'IN_PROGRESS' | 'DELIVERED';

export type ConsumptionKind = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'DRINK' | 'SNACK';
export type ConsumptionSlotStatus = 'OPEN' | 'CLOSED';

export type BenefitKind = 'FEE' | 'CERTIFICATE';
export type BenefitFeeStatus = 'UNPAID' | 'PROCESSING' | 'PAID';
export type BenefitCertificateStatus = 'NOT_PRINTED' | 'PRINTED' | 'DELIVERED';

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  organizationId: string;
  orgRole: OrgRole;
  eventId?: string;
  eventRole?: EventRole;
  divisionId?: string;
  isDivisionHead?: boolean;
}
