import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API, apiUrl } from '../http/api.endpoints';
import { CommunicationActionDto } from '../models/evaas-contracts.model';

@Injectable({ providedIn: 'root' })
export class AdminCommunicationActionService {
  private readonly http = inject(HttpClient);

  getCommunicationActions(): Observable<CommunicationActionDto[]> {
    return this.http.get<CommunicationActionDto[]>(apiUrl(API.adminCommunicationActions.actions));
  }

  getCommunicationActionById(id: number): Observable<CommunicationActionDto> {
    return this.http.get<CommunicationActionDto>(
      apiUrl(API.adminCommunicationActions.actionById(id)),
    );
  }
}
