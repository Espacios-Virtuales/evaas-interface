export interface ProjectCardItem {
  id: string;
  name: string;
  description?: string | null;
  icon?: string;          // ej: "bi-box"
  version?: string;
  techName?: string;
  cloud?: 'GCP' | 'AWS' | 'Azure' | 'DigitalOcean' | string;
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
  