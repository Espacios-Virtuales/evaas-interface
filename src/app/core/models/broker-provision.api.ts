// src/app/core/models/broker-provision.api.ts
import { DbEngine, Provider, ProvisionStatus, Tier } from './provisions.model';

export interface BrokerProvisionApiResponse {
  statusCode: number;        // 201
  status: 'CREATED' | string;
  details: BrokerProvisionDetail[];
}

export interface BrokerProvisionDetail {
  id: string;
  name: string;              // "@google-cloud/storage"
  version?: string;          // "7.17.2"
  description?: string;
  icon?: string;             // "bi-cloud"
  technology: {
    name: string;            // "@google-cloud/storage"
    source: 'NPM' | string;
    homepageUrl?: string;
    registryUrl?: string;
  };
  provisioning: {
    type: 'SERVICE' | string;
    cloudProvider: 'GCP' | 'AWS' | 'DO' | 'DIGITAL_OCEAN' | string;
    fqdn: string | null;
    compute: {
      tier: 'S' | 'M' | 'P' | string;   // letras en API → S/M/P
      vcpu: number;                      // 2
      ramGb: number;                     // 4
    };
    database: {
      enabled: boolean;
      engine: 'POSTGRES' | 'MYSQL' | 'MONGODB' | 'NONE' | string;
      version: string | null;
    };
  };
  gitRepo?: string | null;
}

// ————— Helpers de normalización hacia tus enums internos —————
export function mapApiProvider(p: string): Provider {
  switch (p) {
    case 'GCP': return Provider.GCP;
    case 'AWS': return Provider.AWS;
    case 'DO':
    case 'DIGITAL_OCEAN':
    case 'DIGITALOCEAN':
      return Provider.DIGITAL_OCEAN;
    default:
      // fallback conservador
      return Provider.GCP;
  }
}

export function mapApiTier(letter: string): Tier {
  switch (letter) {
    case 'S': return Tier.STARTER;
    case 'M': return Tier.STANDARD;
    case 'P': return Tier.PRO;
    default:  return Tier.STARTER;
  }
}

export function mapApiDbEngine(e: string | undefined): DbEngine | undefined {
  switch (e) {
    case 'POSTGRES': return DbEngine.POSTGRES;
    case 'MYSQL':    return DbEngine.MYSQL;
    case 'MONGODB':  return DbEngine.MONGODB;
    case 'NONE':
    case undefined:
    case null as any:
      return undefined;
    default:
      return undefined;
  }
}

export function mapApiStatusToProvisionStatus(code: number): ProvisionStatus {
  // El broker responde 201 CREATED → “queued” para nuestro sistema
  return code === 201 ? ProvisionStatus.QUEUED : ProvisionStatus.ERROR;
}
