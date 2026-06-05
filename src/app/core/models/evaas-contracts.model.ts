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
  status?: string;
  ownerUserId?: number;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface AdminResourceDto {
  [key: string]: unknown;
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
