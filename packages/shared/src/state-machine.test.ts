import { describe, it, expect } from 'vitest';
import { RequisitionStateMachine } from './state-machine';

describe('RequisitionStateMachine', () => {
  const baseContext = {
    actorId: 'user-author',
    actorDivisionId: 'div-acara',
    isActorDivisionHead: false,
    requestedBy: 'user-author',
    fromDivisionId: 'div-acara',
    toDivisionId: 'div-logistik',
  };

  it('allows author to submit DRAFT to SUBMITTED', () => {
    const res = RequisitionStateMachine.canTransition('DRAFT', 'SUBMITTED', baseContext);
    expect(res.valid).toBe(true);
  });

  it('prevents non-author non-head from submitting', () => {
    const res = RequisitionStateMachine.canTransition('DRAFT', 'SUBMITTED', {
      ...baseContext,
      actorId: 'user-stranger',
    });
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('REQUISITION_UNAUTHORIZED_SUBMIT');
  });

  it('allows target division head to APPROVE', () => {
    const res = RequisitionStateMachine.canTransition('SUBMITTED', 'APPROVED', {
      ...baseContext,
      actorId: 'head-logistik',
      actorDivisionId: 'div-logistik',
      isActorDivisionHead: true,
    });
    expect(res.valid).toBe(true);
  });

  it('rejects APPROVAL if not target division head', () => {
    const res = RequisitionStateMachine.canTransition('SUBMITTED', 'APPROVED', {
      ...baseContext,
      actorId: 'head-acara',
      actorDivisionId: 'div-acara',
      isActorDivisionHead: true,
    });
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('REQUISITION_UNAUTHORIZED_APPROVE');
  });

  it('requires at least 10 characters reason on REJECTED', () => {
    const resShortReason = RequisitionStateMachine.canTransition('SUBMITTED', 'REJECTED', {
      ...baseContext,
      actorId: 'head-logistik',
      actorDivisionId: 'div-logistik',
      isActorDivisionHead: true,
      reason: 'gagal',
    });
    expect(resShortReason.valid).toBe(false);
    expect(resShortReason.errorCode).toBe('REQUISITION_REJECT_REASON_REQUIRED');

    const resValidReason = RequisitionStateMachine.canTransition('SUBMITTED', 'REJECTED', {
      ...baseContext,
      actorId: 'head-logistik',
      actorDivisionId: 'div-logistik',
      isActorDivisionHead: true,
      reason: 'Stok logistik tidak mencukupi untuk kebutuhan panggung ini.',
    });
    expect(resValidReason.valid).toBe(true);
  });

  it('disallows jumping from DRAFT directly to FULFILLED', () => {
    const res = RequisitionStateMachine.canTransition('DRAFT', 'FULFILLED', baseContext);
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('REQUISITION_INVALID_TRANSITION');
  });

  it('allows target division to transition APPROVED to IN_PROGRESS and then FULFILLED', () => {
    const ctx = {
      ...baseContext,
      actorId: 'staff-logistik',
      actorDivisionId: 'div-logistik',
    };
    const startRes = RequisitionStateMachine.canTransition('APPROVED', 'IN_PROGRESS', ctx);
    expect(startRes.valid).toBe(true);

    const fulfillRes = RequisitionStateMachine.canTransition('IN_PROGRESS', 'FULFILLED', ctx);
    expect(fulfillRes.valid).toBe(true);
  });

  it('only allows from division head to CLOSE after FULFILLED', () => {
    // Member cannot close
    const memberClose = RequisitionStateMachine.canTransition('FULFILLED', 'CLOSED', {
      ...baseContext,
      actorId: 'member-acara',
      actorDivisionId: 'div-acara',
      isActorDivisionHead: false,
    });
    expect(memberClose.valid).toBe(false);
    expect(memberClose.errorCode).toBe('REQUISITION_UNAUTHORIZED_CLOSE');

    // Head can close
    const headClose = RequisitionStateMachine.canTransition('FULFILLED', 'CLOSED', {
      ...baseContext,
      actorId: 'head-acara',
      actorDivisionId: 'div-acara',
      isActorDivisionHead: true,
    });
    expect(headClose.valid).toBe(true);
  });
});
