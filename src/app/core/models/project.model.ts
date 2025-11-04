export interface ProjectCardItem {
  id: string;
  name: string;
  description?: string | null;
  icon?: string;          // ej: "bi-box"
  version?: string;
  techName?: string;
  cloud?: 'GCP' | 'AWS' | 'Azure' | 'DigitalOcean' | string;
}


export interface ProjectIRequest {
  id: string;
  icon?: string;
  description?: string | null;
  domain?: string | null;
}
  
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;     // pageIndex 0-based
  size: number;
  first: boolean;
  last: boolean;
}
  
export interface PageResult<T> {
  content: T[];
  total: number;
  pageIndex: number;  // 0-based p/ UI
  pageSize: number;
}

// Proyect DTO y tipos relacionados

export interface TechnologyInfo {
  name: string;
  source?: string;
  homepageUrl?: string | null;
  registryUrl?: string | null;
}

export interface ComputeSpec {
  tier: 'XS' | 'S' | 'M' | 'L' | 'XL' | string;
  vcpu: number;
  ramGb: number;
}

export interface DatabaseSpec {
  enabled: boolean;
  engine?: 'POSTGRES' | 'MYSQL' | 'MONGODB' | string;
  version?: string | null;
}

export interface ProvisioningInfo {
  type: 'SERVICE' | 'APP' | 'WORKER' | string;
  cloudProvider?: 'GCP' | 'AWS' | 'Azure' | 'DigitalOcean' | string;
  fqdn?: string | null;
  compute?: ComputeSpec;
  database?: DatabaseSpec;
}

export interface ProjectDto {
  id: string;
  name: string;
  version?: string | null;
  description?: string | null;
  icon?: string | null;            // ej: "bi-box"
  iconUrl?: string | null;         // URL SVG opcional
  gitRepo?: string | null;
  technology?: TechnologyInfo;
  provisioning?: ProvisioningInfo;
}

export interface ProjectUpdateRequest {
  icon?: string | null;
  gitRepo?: string | null;
  provisioning?: {
    fqdn?: string | null;
  };
}
