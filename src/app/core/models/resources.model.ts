export interface PackageItem {
    name: string;
    version: string;
    description?: string;
    links?: { npm?: string; homepage?: string; repository?: string };
  }
  
  export interface PageResult<T> {
    items: T[];
    total: number;
    page: number;
    perPage: number;
  }