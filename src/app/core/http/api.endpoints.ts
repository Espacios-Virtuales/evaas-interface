// src/app/core/http/api.endpoints.ts
import { environment } from '../../../environments/environment';

export function apiUrl(path: string): string {
  return `${environment.apiUrl}${path}`;
}

const publicApiPathPrefixes = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/onboarding/register',
  '/onboarding/activate',
  '/onboarding/resend-activation',
] as const;

export function isPublicApiUrl(url: string): boolean {
  return publicApiPathPrefixes.some(path => url.startsWith(apiUrl(path)));
}

export const API = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  onboarding: {
    register: '/onboarding/register',
    activate: (code: string) => `/onboarding/activate/${encodeURIComponent(code)}`,
    resendActivation: '/onboarding/resend-activation',
  },
  me: {
    toolAccess: '/me/tool-access',
    resources: '/me/resources',
    intake: '/me/intake',
  },
  adminAccess: {
    organizations: '/admin/access/organizations',
    toolAccess: '/admin/access/tool-access',
    organizationById: (id: number) => `/admin/access/organizations/${encodeURIComponent(String(id))}`,
    organizationToolAccess: (id: number) =>
      `/admin/access/organizations/${encodeURIComponent(String(id))}/tool-access`,
    organizationResources: (id: number) =>
      `/admin/access/organizations/${encodeURIComponent(String(id))}/resources`,
  },
  adminCommerce: {
    activations: '/admin/commerce/activations',
    activationById: (id: number) =>
      `/admin/commerce/activations/${encodeURIComponent(String(id))}`,
    activationStatus: (id: number) =>
      `/admin/commerce/activations/${encodeURIComponent(String(id))}/status`,
  },
  adminResources: {
    resources: '/admin/resources',
    resourceById: (id: number) => `/admin/resources/${encodeURIComponent(String(id))}`,
  },
  legacy: {
    auth: {
      register: '/user/register',
    },
    integrations: {
      software: '/integrations/software',
    },
    project: {
      software: '/project/software',
      view: '/project/cards',
      byId: (id: string) => `/project/${encodeURIComponent(id)}`,
    },
  },
};

export const LEGACY_API = API.legacy;
