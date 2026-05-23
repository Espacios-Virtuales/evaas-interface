import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API, apiUrl } from '../http/api.endpoints';
import { MyResourceDto, MyToolAccessDto } from '../models/evaas-contracts.model';

@Injectable({ providedIn: 'root' })
export class MeService {
  private http = inject(HttpClient);

  getMyToolAccess(): Observable<MyToolAccessDto[]> {
    return this.http.get<MyToolAccessDto[]>(apiUrl(API.me.toolAccess));
  }

  getMyResources(): Observable<MyResourceDto[]> {
    return this.http.get<MyResourceDto[]>(apiUrl(API.me.resources));
  }
}
