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
  name: string;
  taxId?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  ownerUserId?: number | null;
  ownerEmail?: string | null;
  enabled: boolean;
  createdAt?: string | null;
}

export interface OrganizationMemberDto {
  canonicalId: string;
  userId: number;
  userEmail: string;
  role: string;
  status: string;
}

export interface CreateOrganizationRequest {
  name: string;
  taxId?: string;
  ownerUserId?: number;
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
  status?: string;
  visibility?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** Canonical catalogue item returned by GET /admin/instruments. */
export interface AdminInstrumentDto {
  canonicalId: string;
  key: string;
  status: string;
}

/** Read-only administrative evidence returned by GET /admin/communication-actions. */
export interface CommunicationActionDto {
  id: number;
  organizationId: number;
  sourceSystem?: string | null;
  channel?: string | null;
  operation?: string | null;
  status: string;
  approvalStatus?: string | null;
  recipientAddress?: string | null;
  recipientDisplayName?: string | null;
  subject?: string | null;
  contentSummary?: string | null;
  templateKey?: string | null;
  provider?: string | null;
  providerMessageId?: string | null;
  providerThreadId?: string | null;
  lioraCommunicationId?: string | null;
  lioraTechnicalStatus?: string | null;
  lioraRequestId?: string | null;
  lioraLastSyncedAt?: string | null;
  lioraLastErrorCode?: string | null;
  lioraLastErrorMessage?: string | null;
  idempotencyKey?: string | null;
  requestId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateAdminResourcePayload {
  organizationId: number;
  toolAccessId?: number;
  type: string;
  key?: string;
  name: string;
  url?: string;
  status?: string;
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
