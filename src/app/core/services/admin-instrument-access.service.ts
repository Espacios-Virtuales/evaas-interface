import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API, apiUrl } from '../http/api.endpoints';
import {
  CreateInstrumentAccessRequest,
  InstrumentAccessDto,
  UpdateInstrumentAccessStatusRequest,
} from '../models/evaas-contracts.model';

/** Canonical InstrumentAccess administration, deliberately separate from legacy AdminAccessService. */
@Injectable({ providedIn: 'root' })
export class AdminInstrumentAccessService {
  private readonly http = inject(HttpClient);

  getOrganizationInstrumentAccess(organizationRef: string): Observable<InstrumentAccessDto[]> {
    return this.http.get<InstrumentAccessDto[]>(
      apiUrl(API.adminInstrumentAccess.byOrganization(organizationRef)),
    );
  }

  grantInstrumentAccess(
    organizationRef: string,
    payload: CreateInstrumentAccessRequest,
  ): Observable<InstrumentAccessDto> {
    return this.http.post<InstrumentAccessDto>(
      apiUrl(API.adminInstrumentAccess.byOrganization(organizationRef)),
      payload,
    );
  }

  updateInstrumentAccessStatus(
    organizationRef: string,
    instrumentAccessRef: string,
    payload: UpdateInstrumentAccessStatusRequest,
  ): Observable<InstrumentAccessDto> {
    return this.http.patch<InstrumentAccessDto>(
      apiUrl(API.adminInstrumentAccess.status(organizationRef, instrumentAccessRef)),
      payload,
    );
  }
}
