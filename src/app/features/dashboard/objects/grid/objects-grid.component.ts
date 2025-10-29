import { Component, DestroyRef, Injector, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { ProjectsService } from '../../../../core/services/project.service'; 
import { ObjectCardComponent } from '../card/object-card.component'; 

@Component({
  standalone: true,
  selector: 'ev-objects-grid',
  imports: [CommonModule, ReactiveFormsModule, ObjectCardComponent],
  templateUrl: './objects-grid.component.html',
  styleUrls: [`./objects-grid.component.scss`]
})
export class ObjectsGridComponent implements OnInit {
  private svc = inject(ProjectsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector   = inject(Injector);


  // estado UI
  readonly pageIndex = signal(0);
  readonly pageSize  = signal(12);
  readonly total     = signal(0);
  readonly items     = signal<any[]>([]);
  readonly loading   = signal(true);
  readonly pages     = signal(1);

  // búsqueda
  search = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    // ✅ ahora toObservable tiene injector
    const page$  = toObservable(this.pageIndex, { injector: this.injector });
    const size$  = toObservable(this.pageSize,  { injector: this.injector });
    const query$ = this.search.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged(), startWith(this.search.value)
    );

    combineLatest([page$, size$, query$]).pipe(
      switchMap(([i, s, q]) => {
        this.loading.set(true);
        return this.svc.listCards(i, s, q);
      })
    ).subscribe({
      next: p => {
        this.items.set(p.content);
        this.total.set(p.total);
        this.pages.set(Math.max(1, Math.ceil(p.total / this.pageSize())));
        this.loading.set(false);
      },
      error: _ => { this.items.set([]); this.total.set(0); this.pages.set(1); this.loading.set(false); }
    });
  }

  next(){ if (this.pageIndex()+1 < this.pages()) this.pageIndex.update(v => v+1); }
  prev(){ if (this.pageIndex() > 0) this.pageIndex.update(v => v-1); }
}
