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
  taxId?: string;
  enabled?: boolean;
  status?: string;
  ownerUserId?: number;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
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
  [key: string]: unknown;
}

/** Canonical catalogue item returned by GET /admin/instruments. */
export interface AdminInstrumentDto {
  key: string;
  [key: string]: unknown;
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
