import { RequisitionStatus } from './types';

export interface TransitionContext {
  actorId: string;
  actorDivisionId?: string;
  isActorDivisionHead?: boolean;
  isEventManagerOrOwner?: boolean;
  requestedBy: string;
  fromDivisionId: string;
  toDivisionId: string;
  reason?: string;
}

export interface TransitionResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

export const VALID_REQUISITION_TRANSITIONS: Record<RequisitionStatus, RequisitionStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: ['IN_PROGRESS', 'DRAFT'],
  REJECTED: ['DRAFT'],
  IN_PROGRESS: ['FULFILLED', 'DRAFT'],
  FULFILLED: ['CLOSED'],
  CLOSED: [],
};

export class RequisitionStateMachine {
  public static canTransition(
    currentStatus: RequisitionStatus,
    targetStatus: RequisitionStatus,
    context: TransitionContext
  ): TransitionResult {
    const allowed = VALID_REQUISITION_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(targetStatus)) {
      return {
        valid: false,
        errorCode: 'REQUISITION_INVALID_TRANSITION',
        error: `Transisi status tidak valid dari ${currentStatus} ke ${targetStatus}.`,
      };
    }

    // Role & Authority checks based on rules.md Section B4
    switch (targetStatus) {
      case 'SUBMITTED': {
        // Hanya pembuat (requested_by) atau Head divisi pembuat yang boleh men-submit.
        const isAuthor = context.actorId === context.requestedBy;
        const isFromDivisionHead =
          context.actorDivisionId === context.fromDivisionId && context.isActorDivisionHead;
        if (!isAuthor && !isFromDivisionHead && !context.isEventManagerOrOwner) {
          return {
            valid: false,
            errorCode: 'REQUISITION_UNAUTHORIZED_SUBMIT',
            error: 'Hanya pembuat kebutuhan atau Kepala Divisi pembuat yang dapat mengajukan kebutuhan.',
          };
        }
        break;
      }

      case 'APPROVED': {
        // Hanya Head divisi tujuan yang boleh approve (atau Owner/Event Manager)
        const isToDivisionHead =
          context.actorDivisionId === context.toDivisionId && context.isActorDivisionHead;
        if (!isToDivisionHead && !context.isEventManagerOrOwner) {
          return {
            valid: false,
            errorCode: 'REQUISITION_UNAUTHORIZED_APPROVE',
            error: 'Hanya Kepala Divisi tujuan yang berhak menyetujui kebutuhan ini.',
          };
        }
        break;
      }

      case 'REJECTED': {
        // Hanya Head divisi tujuan yang boleh reject
        const isToDivisionHead =
          context.actorDivisionId === context.toDivisionId && context.isActorDivisionHead;
        if (!isToDivisionHead && !context.isEventManagerOrOwner) {
          return {
            valid: false,
            errorCode: 'REQUISITION_UNAUTHORIZED_REJECT',
            error: 'Hanya Kepala Divisi tujuan yang berhak menolak kebutuhan ini.',
          };
        }
        // Reject MUST menyertakan alasan (minimal 10 karakter)
        if (!context.reason || context.reason.trim().length < 10) {
          return {
            valid: false,
            errorCode: 'REQUISITION_REJECT_REASON_REQUIRED',
            error: 'Penolakan kebutuhan wajib menyertakan alasan minimal 10 karakter.',
          };
        }
        break;
      }

      case 'IN_PROGRESS': {
        // Divisi tujuan memulai pengerjaan
        const isTargetDivision = context.actorDivisionId === context.toDivisionId;
        if (!isTargetDivision && !context.isEventManagerOrOwner) {
          return {
            valid: false,
            errorCode: 'REQUISITION_UNAUTHORIZED_IN_PROGRESS',
            error: 'Hanya divisi tujuan yang dapat memproses kebutuhan ini ke dalam pengerjaan.',
          };
        }
        break;
      }

      case 'FULFILLED': {
        // Divisi tujuan menandai terpenuhi
        const isTargetDivision = context.actorDivisionId === context.toDivisionId;
        if (!isTargetDivision && !context.isEventManagerOrOwner) {
          return {
            valid: false,
            errorCode: 'REQUISITION_UNAUTHORIZED_FULFILL',
            error: 'Hanya divisi tujuan yang dapat menandai kebutuhan ini selesai terpenuhi.',
          };
        }
        break;
      }

      case 'CLOSED': {
        // Transisi ke CLOSED hanya oleh Head divisi pembuat, dan hanya setelah FULFILLED.
        const isFromDivisionHead =
          context.actorDivisionId === context.fromDivisionId && context.isActorDivisionHead;
        if (!isFromDivisionHead && !context.isEventManagerOrOwner) {
          return {
            valid: false,
            errorCode: 'REQUISITION_UNAUTHORIZED_CLOSE',
            error: 'Penutupan kebutuhan hanya boleh dilakukan oleh Kepala Divisi pembuat.',
          };
        }
        break;
      }

      case 'DRAFT': {
        // Revisi kembali ke draft dari REJECTED atau APPROVED / IN_PROGRESS sebelum FULFILLED
        const isAuthor = context.actorId === context.requestedBy;
        const isFromDivision = context.actorDivisionId === context.fromDivisionId;
        if (!isAuthor && !isFromDivision && !context.isEventManagerOrOwner) {
          return {
            valid: false,
            errorCode: 'REQUISITION_UNAUTHORIZED_REVISE',
            error: 'Hanya pembuat atau anggota divisi pembuat yang dapat merevisi kebutuhan ini.',
          };
        }
        break;
      }
    }

    return { valid: true };
  }
}
