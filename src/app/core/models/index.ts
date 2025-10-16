export interface User { 
    id: string; name: string; 
    email: string; role: 
    Role; 
}
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

export interface Role {
    id: number;
    roleEnum: string; // "ROLE_ADMIN" | "ROLE_USER" | etc.
    privileges: Privilege[];
}

export interface Privilege {
    id: number;
    type: string; // "READ" | "WRITE" | etc.
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

export interface UserSession {
    email: string;
    roles: string[];        // ['ROLE_USER', ...] (puedes derivarlo de role.roleEnum)
    privileges: string[];   // ['READ','WRITE',...]
    accessToken: string;
    accessTokenExp: Date;   // new Date(payload.exp * 1000)
    refreshToken: string;
    refreshExp: Date;       // new Date(Date.parse(issuedAt) + refreshExpiresIn * 1000)
}

export interface JwtPayload {
    iss: string;   // "Espacios Virtuales"
    sub: string;   // "admin@espaciosvirtuales.cl"
    jti: string;   // id del token
    ver: number;   // versión interna
    iat: number;   // epoch seconds
    exp: number;   // epoch seconds
}