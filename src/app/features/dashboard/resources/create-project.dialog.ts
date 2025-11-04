import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SoftwareItem } from '../../../core/models/software.model';
import { ProjectsService } from '../../../core/services/project.service';
import { Provider, Tier, DbEngine, ProvisionRequest } from '../../../core/models/provisions.model';


@Component({
  standalone: true,
  selector: 'evaas-create-project-dialog',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatButtonModule, MatIconModule, MatDialogModule
  ],
  templateUrl: './create-project.dialog.html',
  styleUrls: ['./create-project.dialog.scss']
})
export class CreateProjectDialogComponent {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<CreateProjectDialogComponent>);
  private service = inject(ProjectsService);


  providers = [
    { value: Provider.GCP, label: 'GCP' },
    { value: Provider.AWS, label: 'AWS' },
    { value: Provider.DIGITAL_OCEAN, label: 'DigitalOcean' }
  ] as const;

  tiers = [
    { value: Tier.STARTER,  label: 'Starter'  },
    { value: Tier.STANDARD, label: 'Standard' },
    { value: Tier.PRO,      label: 'Pro'      }
  ] as const;

  dbEngines = [
    { value: DbEngine.POSTGRES, label: 'PostgreSQL' },
    { value: DbEngine.MYSQL,    label: 'MySQL'      },
    { value: DbEngine.MONGODB,  label: 'MongoDB'    }
  ] as const;

  submitting = false;

  form = this.fb.group({
    provider:    [Provider.GCP, Validators.required],
    projectName: ['', [Validators.required, Validators.minLength(3)]],
    domain:      ['', [Validators.required]],
    tier:        [Tier.STARTER, Validators.required],
    cpu:         [1, [Validators.required, Validators.min(1)]],
    ram:         [1, [Validators.required, Validators.min(1)]],
    dbEnabled:   [false],
    dbEngine:    [DbEngine.POSTGRES],
    dbVersion:   [''],
    gitRepo:     ['']
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: SoftwareItem) {
    const suggested = (data.slug || data.name).toLowerCase().replace(/\s+/g, '-');
    this.form.patchValue({ projectName: `${suggested}-app` });
  }

  submit() {
    if (this.form.invalid) return;

    const v = this.form.value;
    const payload: ProvisionRequest = {
      technology: (this.data.slug || this.data.name).toLowerCase(),
      version: this.data.version,
      provider: v.provider!,
      domain: v.domain!,
      projectName: v.projectName!,
      compute: { tier: v.tier!, cpu: v.cpu!, ram: v.ram! },
      database: {
        enabled: !!v.dbEnabled,
        engine: v.dbEnabled ? v.dbEngine! : undefined,
        version: v.dbEnabled && v.dbVersion ? v.dbVersion : undefined
      },
      gitRepo: v.gitRepo || undefined
    };

    this.submitting = true;
    this.service.createProject(payload).subscribe({
      next: (res /* ProvisionResponse */) => {
        this.ref.close({
          ok: true,
          response: res,
          name: this.form.value.projectName
        });
      },
      error: (err) => {
        console.error('[CreateProjectDialog] createProject error', err);
        this.ref.close({ ok: false, error: 'No fue posible crear el proyecto. Intenta nuevamente.' });
      }
    });
  }

  close() { this.ref.close(false); }
}
