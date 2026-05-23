import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PageResult, ProjectCardItem, ProjectDto, ProjectUpdateRequest, SpringPage } from '../models/project.model';
import { LEGACY_API, apiUrl } from '../http/api.endpoints';
import { ProvisionRequest, ProvisionResponse, ProvisionStatus } from '../models/provisions.model';
import { ApiProvisionResponse } from '../types/api.type';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);

  /** Crear proyecto: SIEMPRE entrega ProvisionResponse mínimo */
  createProject(payload: ProvisionRequest) {
    return this.http
      .post<ApiProvisionResponse>(apiUrl(LEGACY_API.project.software), payload)
      .pipe(
        map((r): ProvisionResponse => ({
          id: r?.details?.[0]?.id ?? 'unknown',            // id real de details[0]
          status: r?.status as ProvisionStatus,            // mapea al enum si aplica
          message: r?.message                              // opcional
        }))
      );
  }

  /** Listar tarjetas desde /project/cards con búsqueda y paginación (0-based en UI). */
  listCards(pageIndex = 0, pageSize = 12, q = ''): Observable<PageResult<ProjectCardItem>> {
    const params = new HttpParams()
      .set('page', pageIndex)       // backend Spring ya usa 0-based (según tu payload)
      .set('size', pageSize)
      .set('q', (q ?? '').trim());

    return this.http.get<SpringPage<ProjectCardItem>>(apiUrl(LEGACY_API.project.view), { params }).pipe(
      map(p => ({
        content: p.content ?? [],
        total: p.totalElements ?? (p.content?.length ?? 0),
        pageIndex: p.number ?? pageIndex,
        pageSize: p.size ?? pageSize
      }))
    );
  }

  /** GET /projects/{id} → ProjectDto */
  getProject(id: string): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(apiUrl(LEGACY_API.project.byId(id)));
  }

  /** PUT /projects/{id} (solo campos esenciales) */
  updateProject(id: string, payload: ProjectDto): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(apiUrl(LEGACY_API.project.byId(id)), payload);
  }

  /** DELETE /projects/{id} */
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(apiUrl(LEGACY_API.project.byId(id)));
  }
}
