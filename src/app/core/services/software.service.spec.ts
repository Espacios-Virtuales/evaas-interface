// src/app/core/services/software.service.provision.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectsService } from './project.service';
import { LEGACY_API, apiUrl } from '../http/api.endpoints';
import { ProvisionRequest, ProvisionStatus, Tier, Provider, DbEngine } from '../models/provisions.model';
import { BrokerProvisionApiResponse } from '../models/broker-provision.api';

describe('ProjectsService.createProject (broker wrapper to domain mapping)', () => {
  let svc: ProjectsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectsService, provideHttpClient(), provideHttpClientTesting()]
    });
    svc = TestBed.inject(ProjectsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps the broker response to the minimal provision response', () => {
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

    svc.createProject(payload).subscribe(job => {
      jobId = job.id;
      expect(job.status).toBe(ProvisionStatus.CREATED);
      expect(job.message).toBe('created');
    });

    const req = http.expectOne(
      r => r.method === 'POST' && r.url === apiUrl(LEGACY_API.project.software)
    );

    const apiBody: BrokerProvisionApiResponse = {
      statusCode: 201,
      status: 'CREATED',
      message: 'created',
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
  });
});
