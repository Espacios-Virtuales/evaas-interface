// src/app/core/http/api.endpoints.ts
import { environment } from '../../../environments/environment';

export const API = {
  auth: {
    register: `${environment.apiUrl}/user/register`,
    login: `${environment.apiUrl}/auth/login`,
    refresh: `${environment.apiUrl}/auth/refresh`,
    logout: `${environment.apiUrl}/auth/logout`,
  },
  me: {
    toolAccess: `${environment.apiUrl}/me/tool-access`,
  },
  adminAccess: {
    organizations: `${environment.apiUrl}/admin/access/organizations`,
    organizationById: (id: number) =>
      `${environment.apiUrl}/admin/access/organizations/${encodeURIComponent(String(id))}`,
    toolAccess: `${environment.apiUrl}/admin/access/tool-access`,
    toolAccessById: (id: number) =>
      `${environment.apiUrl}/admin/access/tool-access/${encodeURIComponent(String(id))}`,
  },
  adminCommerce: {
    activations: `${environment.apiUrl}/admin/commerce/activations`,
    activationStatus: (id: number) =>
      `${environment.apiUrl}/admin/commerce/activations/${encodeURIComponent(String(id))}/status`,
  },
  integrations: {
    software: `${environment.apiUrl}/integrations/software`,
  },
  project: {
    software: `${environment.apiUrl}/project/software`,
    view: `${environment.apiUrl}/project/cards`,
    byId: (id: string) => `${environment.apiUrl}/project/${encodeURIComponent(id)}`,
  }
};
