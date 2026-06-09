import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API, apiUrl } from '../http/api.endpoints';
import {
  AdminResourceDto,
  AdminToolAccessDto,
  CreateOrganizationRequest,
  CreateToolAccessPayload,
  OrganizationDto,
} from '../models/evaas-contracts.model';

@Injectable({ providedIn: 'root' })
export class AdminAccessService {
  private http = inject(HttpClient);

  getOrganizations(): Observable<OrganizationDto[]> {
    return this.http.get<OrganizationDto[]>(apiUrl(API.adminAccess.organizations));
  }

  createOrganization(payload: CreateOrganizationRequest): Observable<OrganizationDto> {
    return this.http.post<OrganizationDto>(apiUrl(API.adminAccess.organizations), payload);
  }

  createToolAccess(payload: CreateToolAccessPayload): Observable<AdminToolAccessDto> {
    return this.http.post<AdminToolAccessDto>(apiUrl(API.adminAccess.toolAccess), payload);
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
}
