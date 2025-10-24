// src/app/core/services/software.service.provision.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SoftwareService } from './software.service';
import { API } from '../http/api.endpoints';
import { ProvisionRequest, ProvisionStatus, Tier, Provider, DbEngine } from '../models/provisions.model';
import { BrokerProvisionApiResponse } from '../models/broker-provision.api';

describe('SoftwareService.createProject (broker wrapper → domain mapping)', () => {
  let svc: SoftwareService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SoftwareService, provideHttpClient(), provideHttpClientTesting()]
    });
    svc = TestBed.inject(SoftwareService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('mapea statusCode 201 → QUEUED, S/M/P → Tier, GCP/AWS/DO → Provider, DB NONE → undefined', () => {
    const payload: ProvisionRequest = {
      technology: '@google-cloud/storage',
      version: '7.17.2',
      provider: Provider.GCP,
      domain: 'app.evaas.lat',
      projectName: 'evaas-gcs',
      compute: { tier: Tier.STARTER, cpu: 1, ram: 1 },
      database: { enabled: false },
      gitRepo: undefined
    };

    let jobId: string | undefined;
    let last = svc.lastProvisionJob(); // null inicialmente
    expect(last).toBeNull();

    svc.createProject(payload).subscribe(job => {
      jobId = job.id;
      expect(job.status).toBe(ProvisionStatus.QUEUED);
      expect(job.provider).toBe(Provider.GCP);
      expect(job.compute.tier).toBe(Tier.STARTER);     // 'S' → STARTER
      expect(job.compute.cpu).toBe(2);                 // vcpu
      expect(job.compute.ram).toBe(4);                 // ramGb
      expect(job.database?.enabled).toBeFalse();
      expect(job.database?.engine).toBeUndefined();    // NONE → undefined
      expect(job.technologyName).toBe('@google-cloud/storage');
    });

    const req = http.expectOne(r => r.method === 'POST' && r.url === API.provisions.software);

    const apiBody: BrokerProvisionApiResponse = {
      statusCode: 201,
      status: 'CREATED',
      details: [
        {
          id: '498a3a72-cdac-451f-9dc7-dd46f2a184a5',
          name: '@google-cloud/storage',
          version: '7.17.2',
          description: 'Cloud Storage Client Library for Node.js',
          icon: 'bi-cloud',
          technology: {
            name: '@google-cloud/storage',
            source: 'NPM',
            homepageUrl: 'https://github.com/googleapis/nodejs-storage#readme',
            registryUrl: 'https://www.npmjs.com/package/@google-cloud/storage'
          },
          provisioning: {
            type: 'SERVICE',
            cloudProvider: 'GCP',
            fqdn: null,
            compute: { tier: 'S', vcpu: 2, ramGb: 4 },
            database: { enabled: false, engine: 'NONE', version: null }
          },
          gitRepo: null
        }
      ]
    };

    req.flush(apiBody);

    expect(jobId).toBe('498a3a72-cdac-451f-9dc7-dd46f2a184a5');

    // cache en memoria actualizado
    const cached = svc.lastProvisionJob();
    expect(cached?.id).toBe(jobId);
    expect(cached?.compute.cpu).toBe(2);
  });
});
