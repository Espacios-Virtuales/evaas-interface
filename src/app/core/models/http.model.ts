import { Role } from "./auth.model";

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface RegistrationResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
}

export interface RegistrationResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
}

export interface AuthRequest { 
    email: string; 
    password: string; 
}

export interface AuthResponse { 
    token: string; 
    username: string;
    role: Role[];
    issuedAt: string;         
    refreshToken: string;
    refreshExpiresIn: number; 
    message: string;
}
