// src/app/features/resources/resources-dashboard.component.ts
import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SoftwareService } from '../../../core/services/software.service';
import { SoftwareItem } from '../../../core/models/software.model';
import { CreateProjectDialogComponent } from './create-project.dialog'; 

@Component({
  standalone: true,
  selector: 'evaas-resources-dashboard',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './resources-dashboard.component.html',
  styleUrls: ['./resources-dashboard.component.scss']
})
export class ResourcesDashboardComponent {
  private service = inject(SoftwareService);
  private dialog = inject(MatDialog);

  // estado
  readonly pageIndex = signal(0);
  readonly pageSize  = signal(10);
  readonly total     = signal(0);
  readonly loading   = signal(true);
  readonly error     = signal<string | null>(null);
  readonly items     = signal<SoftwareItem[]>([]);
  readonly cols      = ['name', 'vendor', 'category', 'actions'] as const;

  // búsqueda
  readonly search = new FormControl<string>('', { nonNullable: true });
  readonly hasAnyData = computed(() => this.items().length > 0);

  constructor() {
    this.load(); // primera carga

    // recarga al cambiar paginación (efecto reactivo)
    effect(() => { this.pageIndex(); this.pageSize(); });

    // búsqueda con debounce
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex.set(0); // reiniciar a la primera página
        this.load();
      });
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .list(this.pageIndex(), this.pageSize(), this.search.value ?? '')
      .subscribe({
        next: (p) => {
          this.total.set(p.total);
          this.items.set(p.content);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('No fue posible cargar los recursos.');
          this.items.set([]);
          this.total.set(0);
          this.loading.set(false);
          console.error('[ResourcesDashboard] list() error', err);
        }
      });
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  openCreate(software: SoftwareItem) {
    this.dialog.open(CreateProjectDialogComponent, {
      panelClass: 'full-dialog',
      width: '680px',
      data: software
    }).afterClosed().subscribe(done => {
      if (done) this.load();
    });
  }
}
