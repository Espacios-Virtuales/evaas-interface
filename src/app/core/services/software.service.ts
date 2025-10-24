// src/app/core/services/software.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, tap } from 'rxjs';
import { SoftwareItem, SoftwareItemRaw } from '../models/software.model'; 
import {
  ProvisionRequest, ProvisionResponse, ProvisionJob,
  ProvisionStatus, Provider, Tier, DbEngine
} from '../models/provisions.model';
import { API } from '../http/api.endpoints';

import {
  BrokerProvisionApiResponse,
  mapApiProvider, mapApiTier, mapApiDbEngine, mapApiStatusToProvisionStatus
} from '../models/broker-provision.api';

interface Page<T> { content: T[]; total: number; }

@Injectable({ providedIn: 'root' })
export class SoftwareService {
  private http = inject(HttpClient);

  // cache en memoria (último job creado) – usa Signals para ergonomía Angular 16+
  readonly lastProvisionJob = signal<ProvisionJob | null>(null);

  // Busca software con paginación estándar
  list(pageIndex = 0, pageSize = 10, search = ''): Observable<Page<SoftwareItem>> {
    const apiPage = pageIndex + 1;
    const apiSize = Math.max(1, pageSize);
  
    const params = new HttpParams()
      .set('page', String(apiPage))
      .set('size', String(apiSize))
      .set('q', (search ?? '').trim());
  
    // ⚠️ NO tipamos aquí a Page<SoftwareItemRaw> porque el backend varía el shape
    return this.http.get<unknown>(API.integrations.software, { params }).pipe(
      map((raw: any) => {
        // 1) normalizar “lista”
        const list =
          Array.isArray(raw?.content) ? raw.content :
          Array.isArray(raw?.items)   ? raw.items   :
          Array.isArray(raw)          ? raw         :
          [];
  
        // 2) total robusto
        const total =
          typeof raw?.total === 'number' ? raw.total :
          typeof raw?.count === 'number' ? raw.count :
          list.length;
  
        // 3) mapear seguro
        const content: SoftwareItem[] = list.map((r: any) => this.enrich(r as SoftwareItemRaw));
  
        return { total, content } as Page<SoftwareItem>;
      })
    );
  }
  
  // Nuevo: enriquece la respuesta del broker y la deja en memoria
  createProject(payload: ProvisionRequest): Observable<ProvisionJob> {
    return this.http.post<BrokerProvisionApiResponse>(API.provisions.software, payload).pipe(
      map((res): ProvisionJob => {
        const status = mapApiStatusToProvisionStatus(res.statusCode);
        const d = res.details?.[0];
        if (!d) {
          // En caso de respuesta inesperada
          return { id: crypto.randomUUID(), status: ProvisionStatus.ERROR, message: 'Respuesta sin detalles' } as ProvisionJob;
        }

        const prov = d.provisioning;
        const job: ProvisionJob = {
          id: d.id,
          status,
          message: res.status,
          name: d.name,
          technologyName: d.technology?.name ?? d.name,
          homepageUrl: d.technology?.homepageUrl,
          registryUrl: d.technology?.registryUrl,
          provider: mapApiProvider(prov.cloudProvider),
          fqdn: prov.fqdn,
          compute: {
            tier: mapApiTier(prov.compute.tier),
            cpu: prov.compute.vcpu,
            ram: prov.compute.ramGb,
          },
          database: {
            enabled: !!prov.database.enabled,
            engine: mapApiDbEngine(prov.database.engine),
            version: prov.database.version ?? undefined,
          },
          gitRepo: d.gitRepo ?? undefined,
        };

        return job;
      }),
      tap(job => this.lastProvisionJob.set(job)) // cache en memoria
    );
  }

  private enrich = (raw: SoftwareItemRaw): SoftwareItem => {
    const displayName = raw.version ? `${raw.name} ${raw.version}` : raw.name;
    return { ...raw, displayName, actions: { createProject: true } };
  };
}
