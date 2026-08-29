import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API, apiUrl } from '../http/api.endpoints';
import { AdminInstrumentDto } from '../models/evaas-contracts.model';

@Injectable({ providedIn: 'root' })
export class AdminInstrumentService {
  private readonly http = inject(HttpClient);

  getInstruments(): Observable<AdminInstrumentDto[]> {
    return this.http.get<AdminInstrumentDto[]>(apiUrl(API.adminInstruments.instruments));
  }
}
