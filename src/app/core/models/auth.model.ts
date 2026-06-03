export interface User { 
    id: string; name: string; 
    email: string; role: 
    Role; 
}

export interface Role {
    id: number;
    roleEnum: string; // "ROLE_ADMIN" | "ROLE_USER" | "ROLE_COMPANY"  -> Transformar a enum si es necesario
    privileges: Privilege[];
}

export interface Privilege {
    id: number;
    type: string; // "READ" | "WRITE" | -> Transformar a enum si es necesario
}

export interface UserSession {
    email: string;
    roles: string[];        // ['ROLE_USER', ...] (puedes derivarlo de role.roleEnum)
    privileges: string[];   // ['READ','WRITE',...]
    token: string;
    tokenExp: Date;         // new Date(payload.exp * 1000)
    refreshToken?: string;
    refreshExp?: Date;      // new Date(Date.parse(issuedAt) + refreshExpiresIn * 1000)
    loginAt?: Date;
}

export interface JwtPayload {
    iss: string;   // "Espacios Virtuales"
    sub: string;   // "admin@espaciosvirtuales.cl"
    jti: string;   // id del token
    ver: number;   // versión interna
    iat: number;   // epoch seconds
    exp: number;   // epoch seconds
}
