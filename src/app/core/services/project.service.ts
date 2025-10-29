import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PageResult, ProjectCardItem, SpringPage } from '../models/project.model';
import { API } from '../http/api.endpoints';
import { ProvisionRequest } from '../models/provisions.model';


@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);

  /** Crear proyecto (no guardamos nada en memoria). */
  createProject(payload: ProvisionRequest) {
    return this.http.post<{ id: string; status: string; message?: string }>(API.project.software, payload);
  }

  /** Listar tarjetas desde /project/cards con búsqueda y paginación (0-based en UI). */
  listCards(pageIndex = 0, pageSize = 12, q = ''): Observable<PageResult<ProjectCardItem>> {
    const params = new HttpParams()
      .set('page', pageIndex)       // backend Spring ya usa 0-based (según tu payload)
      .set('size', pageSize)
      .set('q', (q ?? '').trim());

    return this.http.get<SpringPage<ProjectCardItem>>(API.project.view, { params }).pipe(
      map(p => ({
        content: p.content ?? [],
        total: p.totalElements ?? (p.content?.length ?? 0),
        pageIndex: p.number ?? pageIndex,
        pageSize: p.size ?? pageSize
      }))
    );
  }
}
