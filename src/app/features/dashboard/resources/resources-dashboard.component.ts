// src/app/features/resources/resources-dashboard.component.ts
import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
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
import { catchError, debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';
import { SoftwareService } from '../../../core/services/software.service';
import { SoftwareItem } from '../../../core/models/software.model';
import { CreateProjectDialogComponent } from './create-project.dialog'; 
import { combineLatest, of, Subscription } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';



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
export class ResourcesDashboardComponent implements OnDestroy {
  private service = inject(SoftwareService);
  private dialog = inject(MatDialog);

  // estado
  readonly pageIndex = signal(0);     // UI: 0-based
  readonly pageSize  = signal(10);
  readonly total     = signal(0);
  readonly loading   = signal(true);
  readonly error     = signal<string | null>(null);
  readonly items     = signal<SoftwareItem[]>([]);
  readonly cols      = ['name', 'vendor', 'category', 'actions'] as const;

  // búsqueda
  readonly search = new FormControl<string>('', { nonNullable: true });
  readonly hasAnyData = computed(() => this.items().length > 0);

  private sub = new Subscription();

  constructor() {
    // ——— Streams reactivos ———

    // 1) señales -> observables (hot) para paginación
    const pageIndex$ = toObservable(this.pageIndex);
    const pageSize$  = toObservable(this.pageSize);

    // 2) búsqueda con debounce (sin startWith, para poder resetear página al teclear)
    const searchInput$ = this.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

    // resetear SIEMPRE a página 0 cuando cambia la búsqueda
    this.sub.add(
      searchInput$.subscribe(() => this.pageIndex.set(0))
    );

    // 3) versión “sembrada” de búsqueda para la primera carga
    const search$ = searchInput$.pipe(
      startWith(this.search.value)  // dispara la primera consulta
    );

    // 4) consulta única: combineLatest(pageIndex, pageSize, search) + switchMap
    this.sub.add(
      combineLatest([pageIndex$, pageSize$, search$]).pipe(
        tap(() => { this.loading.set(true); this.error.set(null); }),
        switchMap(([i, s, q]) =>
          this.service.list(i, s, q).pipe(
            catchError(err => {
              this.error.set('No fue posible cargar los recursos.');
              console.error('[ResourcesDashboard] list() error', err);
              return of({ total: 0, content: [] });
            })
          )
        )
      ).subscribe(p => {
        this.total.set(p.total);
        this.items.set(p.content);
        this.loading.set(false);
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onPage(e: PageEvent) {
    // NO llamamos a load(): el stream reactivo hará la petición
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }

  openCreate(software: SoftwareItem) {
    this.dialog.open(CreateProjectDialogComponent, {
      data: software,
      maxWidth: '90vw',
      width: '720px',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'evaas-dialog'
    }).afterClosed().subscribe(done => {
      if (done) {
        // recarga manteniendo criterios actuales
        // basta con "tocar" pageIndex para re-disparar el stream
        this.pageIndex.set(this.pageIndex());
      }
    });
  }

  trackById = (_: number, r: SoftwareItem) => r.id;
}