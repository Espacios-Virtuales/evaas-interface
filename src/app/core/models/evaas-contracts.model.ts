export type ToolAccessStatus = 'ENABLED' | 'DISABLED' | string;

export interface MyToolAccessDto {
  toolKey: string;
  organizationId: number;
  organizationName: string;
  status: ToolAccessStatus;
  grantedAt: string;
  revokedAt?: string | null;
}

export interface MyResourceDto {
  [key: string]: unknown;
}

export interface OrganizationDto {
  id: number;
  /** Canonical UUID used by canonical organization relations, including InstrumentAccess. */
  canonicalId: string;
  name: string;
  taxId?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  ownerUserId?: number | null;
  ownerEmail?: string | null;
  enabled: boolean;
  createdAt?: string | null;
}

export type OrganizationMemberRole = 'OWNER' | 'MEMBER';

export type OrganizationMemberStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

export type ResourceType =
  | 'VPS'
  | 'HOSTING'
  | 'CLOUD'
  | 'MANAGED_PLATFORM'
  | 'LOCAL'
  | 'STORAGE'
  | 'DASHBOARD'
  | 'REPOSITORY'
  | 'API'
  | 'POWER_BI'
  | 'WORDPRESS'
  | 'DATABASE'
  | 'DOCUMENTATION'
  | 'OTHER';

/** Read-only governed projection returned by GET /api/v1/me/contextual-projection. */
export interface ContextualProjectionDto {
  version: string;
  identity: ContextualIdentityDto;
  context: ContextualContextDto;
  capabilities: ContextualCapabilityDto[];
  relationships: ContextualRelationshipDto[];
  resources: ContextualResourceDto[];
  actions: ContextualActionDto[];
  results: ContextualResultDto[];
  evidence: ContextualEvidenceDto[];
}

export interface ContextualIdentityDto {
  subjectRef: string;
  enabled: boolean;
}

export interface ContextualContextDto {
  authorities: string[];
  organizationRefs: string[];
}

export interface ContextualCapabilityDto {
  organizationRef: string;
  instrumentAccessRef: string;
  instrumentRef: string;
  instrumentKey: string;
}

export interface ContextualRelationshipDto {
  organizationRef: string;
  organizationName: string;
  organizationEnabled: boolean;
  memberRef: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
}

export interface ContextualResourceDto {
  organizationRef: string;
  type: ResourceType;
  key: string;
  name: string;
  status: ResourceStatus;
}

export interface ContextualActionDto {
  actionKey: string;
  organizationRef: string;
}

export interface ContextualResultDto {
  resultRef: string;
  status: string;
}

export interface ContextualEvidenceDto {
  evidenceRef: string;
  occurredAt: string;
  status: string;
}

/** Governed read-only LIORA evidence returned by GET /api/v1/me/instruments/liora/evidence. */
export interface LioraEvidenceV1Dto {
  instrument: LioraEvidenceInstrumentDto;
  organizations: LioraEvidenceOrganizationDto[];
}

export interface LioraEvidenceInstrumentDto {
  canonicalId: string;
  key: 'LIORA';
  name: string;
}

export interface LioraEvidenceOrganizationDto {
  organizationRef: string;
  organizationName: string;
  instrumentAccess: {
    canonicalId: string;
    status: 'ENABLED';
  };
  evidence: LioraEvidenceRowDto[];
}

export interface LioraEvidenceRowDto {
  actionRef: string;
  notificationType: string;
  status: string;
  occurredAt: string;
  sourceReference: string | null;
  resultRef: string | null;
}

/** Read-only authenticated HUMAN access context returned by GET /me/access-context. */
export interface MyAccessContextDto {
  email: string;
  enabled: boolean;
  authorities: string[];
  organizations: MyOrganizationContextDto[];
}

/** Read-only organization membership in the authenticated HUMAN access context. */
export interface MyOrganizationContextDto {
  organizationRef: string;
  organizationName: string;
  organizationEnabled: boolean;
  memberRef: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
}

export interface OrganizationMemberDto {
  canonicalId: string;
  userId: number;
  userEmail: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
}

export interface UpdateOrganizationOwnerRequest {
  ownerUserId: number;
}

/** Contractual payload for POST /admin/access/organizations/{id}/members. */
export interface CreateOrganizationMemberRequest {
  userId: number;
}

export interface UpdateOrganizationMemberStatusRequest {
  status: OrganizationMemberStatus;
}

export interface CreateOrganizationRequest {
  name: string;
  taxId?: string;
  ownerUserId?: number;
}

/** Administrative profile fields accepted by PUT /admin/access/organizations/{id}. */
export interface UpdateOrganizationRequest {
  name: string;
  taxId: string | null;
  logoUrl: string | null;
  brandColor: string | null;
}

export interface AdminToolAccessDto {
  id: number;
  toolKey: string;
  toolName?: string;
  organizationId: number;
  organizationName: string;
  userId?: number;
  userEmail?: string;
  externalCommerceActivationId?: number;
  status: ToolAccessStatus;
  grantedAt: string;
  revokedAt?: string | null;
}

export interface CreateToolAccessPayload {
  organizationId: number;
  toolKey: string;
  userId: number;
  externalCommerceActivationId?: number;
}

export interface AdminUserLookupDto {
  id: number;
  email: string;
  name?: string;
  enabled?: boolean;
  activated?: boolean;
}

export interface AdminResourceDto {
  id?: number;
  organizationId?: number;
  organizationName?: string;
  toolAccessId?: number | null;
  toolKey?: string | null;
  type?: string;
  provider?: string | null;
  key?: string;
  name?: string;
  url?: string | null;
  status?: ResourceStatus;
  visibility?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** Operational lifecycle of a Resource. It is independent from Deployment and access statuses. */
export type ResourceStatus = 'PLANNED' | 'ACTIVE' | 'MAINTENANCE' | 'DISABLED';

/** Contractual body for PATCH /admin/resources/{id}/status. */
export interface UpdateResourceStatusRequest {
  status: ResourceStatus;
}

/** Canonical catalogue item returned by GET /admin/instruments. */
export interface AdminInstrumentDto {
  canonicalId: string;
  key: string;
  status: string;
}

export type InstrumentAccessStatus = 'ENABLED' | 'SUSPENDED' | 'REVOKED';

/** Canonical organization-to-instrument availability; it is not a user permission. */
export interface InstrumentAccessDto {
  canonicalId: string;
  organizationRef: string;
  instrumentRef: string;
  instrumentKey: string;
  status: InstrumentAccessStatus;
}

export interface CreateInstrumentAccessRequest {
  instrumentRef: string;
}

export interface UpdateInstrumentAccessStatusRequest {
  status: InstrumentAccessStatus;
}

export interface CreateAdminResourcePayload {
  organizationId: number;
  toolAccessId?: number;
  type: string;
  key?: string;
  name: string;
  url?: string;
  status?: ResourceStatus;
  visibility?: string;
  metadataJson?: string;
}

export type ExternalCommerceActivationStatus =
  | 'RECEIVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FAILED'
  | string;

export interface ExternalCommerceActivationDto {
  id: number;
  provider: string;
  externalOrderId?: string | null;
  externalMembershipId?: string | null;
  productCode: string;
  buyerEmail: string;
  organizationName: string;
  status: ExternalCommerceActivationStatus;
  idempotencyKey: string;
  payloadHash: string;
  createdAt?: string;
  updatedAt?: string;
  processedAt?: string | null;
}

export interface CreateActivationPayload {
  provider: string;
  externalOrderId?: string;
  externalMembershipId?: string;
  productCode: string;
  buyerEmail: string;
  organizationName: string;
  status: ExternalCommerceActivationStatus;
  idempotencyKey?: string;
}
