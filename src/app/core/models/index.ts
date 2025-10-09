export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User { id: string; name: string; email: string; role: Role; }
export interface AuthRequest { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; }
export interface AuthResponse { accessToken: string; user: User; }
