import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../http/api.endpoints';
import { PackageItem, PageResult } from '../models/resources.model';

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  private http = inject(HttpClient);

  /**
   * Busca paquetes de software/cloud (proxy NPM) con paginación estándar.
   * @param q Ej: "cloud OR aws OR gcp"
   * @param page 1..N
   * @param perPage 1..50
   */
  searchSoftware(q = 'cloud OR aws OR gcp', page = 1, perPage = 10)
  : Observable<PageResult<PackageItem>> {
    const params = new HttpParams()
      .set('q', q)
      .set('page', page)
      .set('perPage', perPage);

    return this.http.get<PageResult<PackageItem>>(API.integrations.software, { params });
  }
}
