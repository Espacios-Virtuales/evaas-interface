// src/app/core/http/api.endpoints.ts
import { environment } from '../../../environments/environment.development';

export const API = {
  auth: {
    register:`${environment.apiUrl}/user/register`,
    refresh: `${environment.apiUrl}/auth/refresh`, // 👈 aquí tu refresh
    logout:  `${environment.apiUrl}/logout`,
    login:   `${environment.apiUrl}/login`,


  },
  // otros recursos...
};
