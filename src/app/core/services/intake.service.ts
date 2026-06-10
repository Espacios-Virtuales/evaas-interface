import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API, apiUrl } from '../http/api.endpoints';
import { AltaEvaasIntakePayload, AltaEvaasIntakeResponse } from '../models/intake.model';

@Injectable({ providedIn: 'root' })
export class IntakeService {
  private http = inject(HttpClient);

  getMyIntake(): Observable<AltaEvaasIntakeResponse | null> {
    return this.http.get<AltaEvaasIntakeResponse | null>(apiUrl(API.me.intake));
  }

  createMyIntake(payload: AltaEvaasIntakePayload): Observable<AltaEvaasIntakeResponse> {
    return this.http.post<AltaEvaasIntakeResponse>(apiUrl(API.me.intake), payload);
  }

  updateMyIntake(payload: AltaEvaasIntakePayload): Observable<AltaEvaasIntakeResponse> {
    return this.http.put<AltaEvaasIntakeResponse>(apiUrl(API.me.intake), payload);
  }
}
