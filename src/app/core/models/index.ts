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

export interface UserResponse {
    id: number;
    email: string;
    password?: string; // el backend lo trae, pero no lo usaremos en UI
    firstName: string;
    lastName: string;
    enabled: boolean;
    roles: Role[];
}

export interface Role {
    id: number;
    roleEnum: string; // "ROLE_ADMIN" | "ROLE_USER" | etc.
    privileges: RolePrivilege[];
}

export interface RolePrivilege {
    id: number;
    type: string; // "READ" | "WRITE" | etc.
}


export interface AuthRequest { 
    email: string; 
    password: string; 
}

export interface AuthResponse { 
    token: string; username: string; role:string;
}
