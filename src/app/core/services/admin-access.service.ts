import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API, apiUrl } from '../http/api.endpoints';
import {
  AdminResourceDto,
  AdminToolAccessDto,
  AdminUserLookupDto,
  CreateOrganizationRequest,
  CreateToolAccessPayload,
  OrganizationDto,
} from '../models/evaas-contracts.model';

@Injectable({ providedIn: 'root' })
export class AdminAccessService {
  private http = inject(HttpClient);

  getOrganizations(enabled?: boolean): Observable<OrganizationDto[]> {
    const params = enabled === undefined ? undefined : { enabled: String(enabled) };
    return this.http.get<OrganizationDto[]>(apiUrl(API.adminAccess.organizations), { params });
  }

  createOrganization(payload: CreateOrganizationRequest): Observable<OrganizationDto> {
    return this.http.post<OrganizationDto>(apiUrl(API.adminAccess.organizations), payload);
  }

  updateOrganizationStatus(id: number, enabled: boolean): Observable<OrganizationDto> {
    return this.http.patch<OrganizationDto>(
      apiUrl(API.adminAccess.organizationStatus(id)),
      { enabled },
    );
  }

  createToolAccess(payload: CreateToolAccessPayload): Observable<AdminToolAccessDto> {
    return this.http.post<AdminToolAccessDto>(apiUrl(API.adminAccess.toolAccess), payload);
  }

  disableToolAccess(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(API.adminAccess.toolAccessById(id)));
  }

  findUserByEmail(email: string): Observable<AdminUserLookupDto> {
    return this.http.get<unknown>(apiUrl(API.adminUsers.byEmail(email))).pipe(
      map(response => this.normalizeUserLookup(response)),
    );
  }

  getOrganizationById(id: number): Observable<OrganizationDto> {
    return this.http.get<OrganizationDto>(apiUrl(API.adminAccess.organizationById(id)));
  }

  getOrganizationToolAccess(id: number): Observable<AdminToolAccessDto[]> {
    return this.http.get<AdminToolAccessDto[]>(apiUrl(API.adminAccess.organizationToolAccess(id)));
  }

  getOrganizationResources(id: number): Observable<AdminResourceDto[]> {
    return this.http.get<AdminResourceDto[]>(apiUrl(API.adminAccess.organizationResources(id)));
  }

  private normalizeUserLookup(response: unknown): AdminUserLookupDto {
    if (this.isUserLookupDto(response)) return response;

    if (this.isRecord(response)) {
      const data = response['data'];
      if (this.isUserLookupDto(data)) return data;

      const user = response['user'];
      if (this.isUserLookupDto(user)) return user;
    }

    throw new Error('Invalid user lookup response');
  }

  private isUserLookupDto(value: unknown): value is AdminUserLookupDto {
    return this.isRecord(value)
      && typeof value['id'] === 'number'
      && typeof value['email'] === 'string';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
