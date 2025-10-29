// src/app/core/services/software.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, tap } from 'rxjs';
import { SoftwareItem, SoftwareItemRaw } from '../models/software.model'; 
import { computeVirtualTotal } from '../../utils/virtual-paginator'; 

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

  // Busca software con paginación del broker (1-based)
  list(pageIndex = 0, pageSize = 10, search = ''): Observable<Page<SoftwareItem>> {
    // Broker 1-based
    const apiPage = Math.max(1, pageIndex + 1);
    const perPage = Math.max(1, pageSize);
  
    const params = new HttpParams()
      .set('q', (search ?? '').trim())
      .set('page', String(apiPage))
      .set('perPage', String(perPage));
  
    return this.http.get<unknown>(API.integrations.software, { params }).pipe(
      map((raw: any) => {
        const list =
          Array.isArray(raw?.content) ? raw.content :
          Array.isArray(raw?.items)   ? raw.items   :
          Array.isArray(raw)          ? raw         : [];
  
        const content: SoftwareItem[] = list.map((r: any) => this.enrich(r as SoftwareItemRaw));
  
        // 👇 total virtual, MISMA FORMA de retorno
        const total = computeVirtualTotal(pageIndex, pageSize, content.length);
  
        return { total, content } as Page<SoftwareItem>;
      })
    );
  }
  
  // Nuevo: enriquece la respuesta del broker y la deja en memoria
  createProject(payload: ProvisionRequest): Observable<ProvisionJob> {
    return this.http.post<BrokerProvisionApiResponse>(API.project.software, payload).pipe(
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
