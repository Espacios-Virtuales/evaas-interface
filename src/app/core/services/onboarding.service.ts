import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API, apiUrl } from '../http/api.endpoints';

export interface ActivationResponse {
  activated?: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private http = inject(HttpClient);

  activateAccount(code: string): Observable<ActivationResponse> {
    return this.http.get<ActivationResponse>(apiUrl(API.onboarding.activate(code)));
  }
}
