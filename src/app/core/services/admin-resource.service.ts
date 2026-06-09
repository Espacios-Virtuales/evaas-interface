import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API, apiUrl } from '../http/api.endpoints';
import { AdminResourceDto, CreateAdminResourcePayload } from '../models/evaas-contracts.model';

@Injectable({ providedIn: 'root' })
export class AdminResourceService {
  private http = inject(HttpClient);

  getResources(): Observable<AdminResourceDto[]> {
    return this.http.get<AdminResourceDto[]>(apiUrl(API.adminResources.resources));
  }

  getResourceById(id: number): Observable<AdminResourceDto> {
    return this.http.get<AdminResourceDto>(apiUrl(API.adminResources.resourceById(id)));
  }

  createResource(payload: CreateAdminResourcePayload): Observable<AdminResourceDto> {
    return this.http.post<AdminResourceDto>(apiUrl(API.adminResources.resources), payload);
  }
}
