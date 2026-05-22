// src/app/types/auth.types.ts
export enum Role {
  CLIENT = 'ROLE_CLIENT',
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN',
  COMPANY = 'ROLE_COMPANY',
}

export enum Privilege {
  READ = 'READ',
  WRITE = 'WRITE'
}
