import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API, apiUrl } from '../http/api.endpoints';
import { MyAccessContextDto, MyResourceDto, MyToolAccessDto } from '../models/evaas-contracts.model';

@Injectable({ providedIn: 'root' })
export class MeService {
  private http = inject(HttpClient);

  getMyAccessContext(): Observable<MyAccessContextDto> {
    return this.http.get<MyAccessContextDto>(apiUrl(API.me.accessContext));
  }

  getMyToolAccess(): Observable<MyToolAccessDto[]> {
    return this.http.get<MyToolAccessDto[]>(apiUrl(API.me.toolAccess));
  }

  getMyResources(): Observable<MyResourceDto[]> {
    return this.http.get<MyResourceDto[]>(apiUrl(API.me.resources));
  }
}
