// src/app/core/models/provisions.model.ts
export enum Tier { STARTER='starter', STANDARD='standard', PRO='pro' }
export enum DbEngine { POSTGRES='postgres', MYSQL='mysql', MONGODB='mongodb' }
export enum Provider { GCP='gcp', AWS='aws', DIGITAL_OCEAN='digitalOcean' }
export enum ProvisionStatus { QUEUED='queued', PROVISIONING='provisioning', READY='ready', ERROR='error',  CREATED = 'CREATED', ACCEPTED = 'ACCEPTED',FAILED = 'FAILED'}

export interface ComputeSpec {
  tier: Tier;
  cpu: number;
  ram: number;
}

export interface DatabaseSpec {
  enabled: boolean;
  engine?: DbEngine;
  version?: string;
}

export interface ProvisionRequest {
  technology: string;
  version?: string;
  provider: Provider;
  domain: string;
  projectName: string;
  compute: ComputeSpec;
  database: DatabaseSpec;
  gitRepo?: string;
}

// Respuesta mínima (mantén tu contrato previo)
export interface ProvisionResponse {
  id: string;
  status: ProvisionStatus;
  message?: string;
}


// “Job” enriquecido 
export interface ProvisionJob extends ProvisionResponse {
  name: string;
  technologyName: string;
  homepageUrl?: string;
  registryUrl?: string;
  provider: Provider;
  fqdn?: string | null;
  compute: { tier: Tier; cpu: number; ram: number; };
  database?: { enabled: boolean; engine?: DbEngine; version?: string; };
  gitRepo?: string | null;
}
