// src/app/core/services/api-http.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ApiHttpService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private resolve(url: string): string {
    return /^https?:\/\//i.test(url) ? url : `${this.base}${url}`;
  }

  get<T>(url: string, params?: any)    { return this.http.get<T>(this.resolve(url), { params }); }
  post<T>(url: string, body: unknown)  { return this.http.post<T>(this.resolve(url), body); }
  put<T>(url: string, body: unknown)   { return this.http.put<T>(this.resolve(url), body); }
  delete<T>(url: string)               { return this.http.delete<T>(this.resolve(url)); }
}
