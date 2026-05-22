import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../http/api.endpoints';
import { MyToolAccessDto } from '../models/access-contracts.model';

@Injectable({ providedIn: 'root' })
export class ToolAccessService {
  private http = inject(HttpClient);

  getMyToolAccess(): Observable<MyToolAccessDto[]> {
    return this.http.get<MyToolAccessDto[]>(API.me.toolAccess);
  }
}
