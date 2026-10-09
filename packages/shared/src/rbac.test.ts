import { describe, it, expect } from 'vitest';
import { RbacGuard, Actor, ResourceContext } from './rbac';

describe('RbacGuard', () => {
  const orgA = 'org-uuid-a';
  const orgB = 'org-uuid-b';
  const event1 = 'event-uuid-1';
  const divAcara = 'div-acara-1';
  const divLogistik = 'div-logistik-1';

  const ownerActor: Actor = {
    userId: 'user-owner',
    organizationId: orgA,
    orgRole: 'OWNER',
  };

  const volunteerActor: Actor = {
    userId: 'user-volunteer-1',
    organizationId: orgA,
    orgRole: 'MEMBER',
    eventId: event1,
    eventRole: 'VOLUNTEER',
    divisionId: divAcara,
  };

  const headAcaraActor: Actor = {
    userId: 'user-head-acara',
    organizationId: orgA,
    orgRole: 'MEMBER',
    eventId: event1,
    eventRole: 'DIVISION_HEAD',
    divisionId: divAcara,
  };

  it('MUST reject access if tenant organization_id does not match (tenant isolation)', () => {
    const foreignContext: ResourceContext = {
      organizationId: orgB,
    };
    // Even Owner of Org A cannot access Org B data!
    expect(RbacGuard.can(ownerActor, 'read', 'event', foreignContext)).toBe(false);
    expect(RbacGuard.can(ownerActor, 'write', 'event', foreignContext)).toBe(false);
  });

  it('allows EO Owner full RW within same tenant', () => {
    const validContext: ResourceContext = {
      organizationId: orgA,
      eventId: event1,
    };
    expect(RbacGuard.can(ownerActor, 'read', 'event', validContext)).toBe(true);
    expect(RbacGuard.can(ownerActor, 'write', 'event', validContext)).toBe(true);
    expect(RbacGuard.can(ownerActor, 'write', 'organization', validContext)).toBe(true);
  });

  it('allows Volunteer to read own profile but NOT others', () => {
    const ownContext: ResourceContext = {
      organizationId: orgA,
      userId: 'user-volunteer-1',
    };
    const otherContext: ResourceContext = {
      organizationId: orgA,
      userId: 'user-volunteer-2',
    };
    expect(RbacGuard.can(volunteerActor, 'read', 'volunteer', ownContext)).toBe(true);
    expect(RbacGuard.can(volunteerActor, 'read', 'volunteer', otherContext)).toBe(false);
    expect(RbacGuard.can(volunteerActor, 'write', 'volunteer', ownContext)).toBe(false);
  });

  it('allows Division Head to manage own division but not other divisions', () => {
    const ownDivContext: ResourceContext = {
      organizationId: orgA,
      divisionId: divAcara,
    };
    const otherDivContext: ResourceContext = {
      organizationId: orgA,
      divisionId: divLogistik,
    };

    expect(RbacGuard.can(headAcaraActor, 'write', 'division', ownDivContext)).toBe(true);
    expect(RbacGuard.can(headAcaraActor, 'write', 'division', otherDivContext)).toBe(false);
  });

  it('only allows Owner or Event Manager to disburse benefits', () => {
    const ctx: ResourceContext = { organizationId: orgA };
    expect(RbacGuard.can(ownerActor, 'disburse', 'benefit_disburse', ctx)).toBe(true);
    expect(RbacGuard.can(headAcaraActor, 'disburse', 'benefit_disburse', ctx)).toBe(false);
    expect(RbacGuard.can(volunteerActor, 'disburse', 'benefit_disburse', ctx)).toBe(false);
  });
});
