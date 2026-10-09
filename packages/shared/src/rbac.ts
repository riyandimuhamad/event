import { EventRole, OrgRole } from './types';

export type RbacAction = 'read' | 'write' | 'approve' | 'disburse';

export type RbacResource =
  | 'organization'
  | 'event'
  | 'division'
  | 'committee'
  | 'volunteer'
  | 'requisition'
  | 'logistics'
  | 'consumption'
  | 'checkin'
  | 'vendor'
  | 'vendor_crew'
  | 'talent'
  | 'sponsor'
  | 'benefit'
  | 'benefit_disburse'
  | 'audit_log';

export interface Actor {
  userId: string;
  organizationId: string;
  orgRole: OrgRole;
  eventId?: string;
  eventRole?: EventRole;
  divisionId?: string;
  vendorId?: string;
  talentId?: string;
  sponsorId?: string;
}

export interface ResourceContext {
  organizationId: string;
  eventId?: string;
  divisionId?: string;
  targetDivisionId?: string;
  userId?: string;
  vendorId?: string;
  talentId?: string;
  sponsorId?: string;
}

export class RbacGuard {
  public static can(
    actor: Actor,
    action: RbacAction,
    resource: RbacResource,
    context?: ResourceContext
  ): boolean {
    // 1. Tenant check: Actor MUST belong to the same organization
    if (context && context.organizationId !== actor.organizationId) {
      return false;
    }

    // 2. Org Owner has full RW access across everything in their organization
    if (actor.orgRole === 'OWNER') {
      return true;
    }

    const eventRole = actor.eventRole;

    // 3. Event Manager has RW access to almost everything in their event
    if (eventRole === 'EVENT_MANAGER') {
      if (resource === 'organization' && action === 'write') {
        return false; // Only Org Owner can write organization settings
      }
      return true;
    }

    switch (resource) {
      case 'organization':
        return action === 'read';

      case 'event':
        if (action === 'read') return true;
        return false;

      case 'division':
        if (eventRole === 'DIVISION_HEAD') {
          if (action === 'read') return true;
          if (action === 'write') return !context?.divisionId || context.divisionId === actor.divisionId;
        }
        if (eventRole === 'COMMITTEE') {
          return action === 'read';
        }
        return false;

      case 'committee':
        if (eventRole === 'DIVISION_HEAD') {
          if (action === 'read') return true;
          return !context?.divisionId || context.divisionId === actor.divisionId;
        }
        if (eventRole === 'COMMITTEE') {
          if (action === 'read') return true;
          // Committee can only edit own data
          if (action === 'write') return context?.userId === actor.userId;
        }
        return false;

      case 'volunteer':
        if (eventRole === 'DIVISION_HEAD') {
          if (action === 'read') return true;
          return !context?.divisionId || context.divisionId === actor.divisionId;
        }
        if (eventRole === 'COMMITTEE') {
          if (action === 'read') return true;
          return !context?.divisionId || context.divisionId === actor.divisionId;
        }
        if (eventRole === 'VOLUNTEER') {
          // Volunteer can only read own data
          return action === 'read' && context?.userId === actor.userId;
        }
        return false;

      case 'requisition':
        if (eventRole === 'DIVISION_HEAD') {
          if (action === 'read') return true;
          if (action === 'write') {
            // Write for outgoing requisitions from own division
            return !context?.divisionId || context.divisionId === actor.divisionId;
          }
          if (action === 'approve') {
            // Approve for incoming requisitions to own division
            return !context?.targetDivisionId || context.targetDivisionId === actor.divisionId;
          }
        }
        if (eventRole === 'COMMITTEE') {
          if (action === 'read') return true;
          if (action === 'write') {
            return !context?.divisionId || context.divisionId === actor.divisionId;
          }
        }
        return false;

      case 'logistics':
      case 'consumption':
      case 'checkin':
        if (eventRole === 'DIVISION_HEAD' || eventRole === 'COMMITTEE') {
          return true;
        }
        if (eventRole === 'VOLUNTEER' && resource === 'consumption') {
          return action === 'read' && context?.userId === actor.userId;
        }
        if (eventRole === 'VOLUNTEER' && resource === 'logistics') {
          return action === 'read' && context?.userId === actor.userId;
        }
        if (eventRole === 'VENDOR_ADMIN' && resource === 'consumption') {
          return action === 'read';
        }
        if (eventRole === 'VENDOR_CREW' && resource === 'consumption') {
          return action === 'read' && context?.userId === actor.userId;
        }
        return false;

      case 'vendor':
        if (eventRole === 'DIVISION_HEAD' || eventRole === 'COMMITTEE') {
          return action === 'read';
        }
        if (eventRole === 'VENDOR_ADMIN') {
          return !context?.vendorId || context.vendorId === actor.vendorId;
        }
        return false;

      case 'vendor_crew':
        if (eventRole === 'DIVISION_HEAD' || eventRole === 'COMMITTEE') {
          return action === 'read';
        }
        if (eventRole === 'VENDOR_ADMIN') {
          return !context?.vendorId || context.vendorId === actor.vendorId;
        }
        if (eventRole === 'VENDOR_CREW') {
          return action === 'read' && context?.userId === actor.userId;
        }
        return false;

      case 'talent':
        if (eventRole === 'DIVISION_HEAD' || eventRole === 'COMMITTEE') {
          return action === 'read';
        }
        if (eventRole === 'TALENT_MANAGER') {
          return !context?.talentId || context.talentId === actor.talentId;
        }
        return false;

      case 'sponsor':
        if (eventRole === 'DIVISION_HEAD' || eventRole === 'COMMITTEE') {
          return action === 'read';
        }
        if (eventRole === 'SPONSOR_REP') {
          return action === 'read' && (!context?.sponsorId || context.sponsorId === actor.sponsorId);
        }
        return false;

      case 'benefit':
        if (eventRole === 'DIVISION_HEAD') {
          return action === 'read';
        }
        if (eventRole === 'COMMITTEE' || eventRole === 'VOLUNTEER') {
          return action === 'read' && context?.userId === actor.userId;
        }
        return false;

      case 'benefit_disburse':
        // Only Owner and Event Manager can disburse benefits
        return false;

      case 'audit_log':
        if (eventRole === 'DIVISION_HEAD') {
          return action === 'read' && (!context?.divisionId || context.divisionId === actor.divisionId);
        }
        return false;

      default:
        return false;
    }
  }
}
