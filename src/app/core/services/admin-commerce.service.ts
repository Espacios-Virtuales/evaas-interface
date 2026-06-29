import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API, apiUrl } from '../http/api.endpoints';
import {
  CreateActivationPayload,
  ExternalCommerceActivationDto,
} from '../models/evaas-contracts.model';

@Injectable({ providedIn: 'root' })
export class AdminCommerceService {
  private http = inject(HttpClient);

  getActivations(): Observable<ExternalCommerceActivationDto[]> {
    return this.http.get<unknown>(apiUrl(API.adminCommerce.activations)).pipe(
      map(response => this.normalizeActivationList(response)),
    );
  }

  getActivationById(id: number): Observable<ExternalCommerceActivationDto> {
    return this.http.get<ExternalCommerceActivationDto>(apiUrl(API.adminCommerce.activationById(id)));
  }

  createActivation(payload: CreateActivationPayload): Observable<ExternalCommerceActivationDto> {
    return this.http.post<ExternalCommerceActivationDto>(
      apiUrl(API.adminCommerce.activations),
      payload
    );
  }

  updateActivationStatus(id: number, payload: unknown): Observable<ExternalCommerceActivationDto> {
    return this.http.patch<ExternalCommerceActivationDto>(
      apiUrl(API.adminCommerce.activationStatus(id)),
      payload
    );
  }

  private normalizeActivationList(response: unknown): ExternalCommerceActivationDto[] {
    if (Array.isArray(response)) return response as ExternalCommerceActivationDto[];

    if (typeof response !== 'object' || response === null) return [];

    const record = response as Record<string, unknown>;
    const list = record['content'] ?? record['data'] ?? record['items'] ?? [];

    return Array.isArray(list) ? list as ExternalCommerceActivationDto[] : [];
  }
}
