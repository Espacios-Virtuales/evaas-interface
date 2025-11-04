import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProjectsService } from '../../../../core/services/project.service'; 
import { ProjectDto } from '../../../../core/models/project.model';

@Component({
  standalone: true,
  selector: 'ev-project-details-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <h2 class="h5 p-3 m-0">Proyecto</h2>

  <section class="p-3" *ngIf="dto; else loading">
    <div class="mb-2">
      <div class="d-flex align-items-center gap-2">
        <i *ngIf="dto.icon" class="{{ dto.icon }}"></i>
        <strong>{{ dto.name }}</strong>
        <small class="text-muted" *ngIf="dto.version">v{{dto.version}}</small>
      </div>
      <p class="text-muted small mb-2">{{ dto.description || '—' }}</p>
    </div>

    <div class="small mb-3">
      <strong>Tecnología:</strong> {{ dto.technology?.name || '—' }}
      <span *ngIf="dto.technology?.source"> · {{ dto.technology?.source }}</span>
    </div>

    <div class="small mb-3">
      <strong>Cloud:</strong> {{ dto.provisioning?.cloudProvider || '—' }} ·
      <strong>FQDN:</strong> {{ dto.provisioning?.fqdn || '—' }}
    </div>

    <!-- Editar esenciales -->
    <form class="border rounded p-3 mb-3" [formGroup]="form" (ngSubmit)="save()">
      <h3 class="h6">Editar esenciales</h3>

      <mat-form-field class="w-100" appearance="outline">
        <mat-label>Icon (Bootstrap class)</mat-label>
        <input matInput formControlName="icon" placeholder="bi-cloud">
      </mat-form-field>

      <mat-form-field class="w-100" appearance="outline">
        <mat-label>Git repo (URL)</mat-label>
        <input matInput formControlName="gitRepo" placeholder="https://github.com/org/repo">
      </mat-form-field>

      <mat-form-field class="w-100" appearance="outline">
        <mat-label>FQDN</mat-label>
        <input matInput formControlName="fqdn" placeholder="api.midominio.com">
      </mat-form-field>

      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-light" (click)="close()">Cerrar</button>
        <button type="submit" mat-raised-button color="primary" [disabled]="saving || form.pristine">
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>

    <div class="border rounded p-3">
      <h3 class="h6">Eliminar</h3>
      <p class="small text-muted">Esta acción no se puede deshacer.</p>
      <button class="btn btn-outline-danger btn-sm" (click)="confirmDelete()" [disabled]="savingDelete">Eliminar</button>
    </div>
  </section>

  <ng-template #loading>
    <div class="p-4 text-center small text-muted">Cargando…</div>
  </ng-template>
  `
})
export class ProjectDetailsDialogComponent {
  private ref = inject(MatDialogRef<ProjectDetailsDialogComponent>);
  private svc = inject(ProjectsService);
  private fb = inject(FormBuilder);

  dto?: ProjectDto;
  saving = false;
  savingDelete = false;

  form = this.fb.group({
    icon: [''],
    gitRepo: [''],
    fqdn: [''],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }) {
    this.load();
  }

  load() {
    this.svc.getProject(this.data.id).subscribe(d => {
      this.dto = d;
      this.form.setValue({
        icon: d.icon ?? '',
        gitRepo: d.gitRepo ?? '',
        fqdn: d.provisioning?.fqdn ?? ''
      }, { emitEvent: false });
    });
  }

  save() {
    if (!this.dto) return;
    this.saving = true;
  
    // 1) Tomamos el DTO completo actual
    const base = this.dto;
  
    // 2) Hacemos merge SOLO de los campos editados
    const merged: ProjectDto = {
      ...base,
      icon: this.form.value.icon ?? base.icon ?? null,
      gitRepo: this.form.value.gitRepo ?? base.gitRepo ?? null,
      provisioning: {
        ...base.provisioning,
        type: base.provisioning?.type ?? 'default',
        fqdn: this.form.value.fqdn ?? base.provisioning?.fqdn ?? null
      }
    };
  
    // 3) Llamamos PUT con DTO COMPLETO
    this.svc.updateProject(base.id, merged).subscribe({
      next: (updated) => {
        this.saving = false;
        // parche mínimo para refrescar la card
        this.ref.close({
          type: 'updated',
          patch: {
            icon: updated.icon ?? merged.icon ?? undefined,
            description: updated.description ?? base.description ?? undefined
          }
        });
      },
      error: () => this.saving = false
    });
  }
  

  confirmDelete() {
    if (!this.dto) return;
    if (!confirm('¿Eliminar este proyecto?')) return;
    this.savingDelete = true;
    this.svc.deleteProject(this.dto.id).subscribe({
      next: () => this.ref.close({ type: 'deleted' }),
      error: () => this.savingDelete = false
    });
  }

  close(){ this.ref.close(); }
}
