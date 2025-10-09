// src/app/shared/components/toasts/toasts.component.ts
import { Component, computed, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1200">
    <div *ngFor="let t of list()" class="toast show align-items-center text-bg-{{t.type}} border-0 mb-2">
      <div class="d-flex">
        <div class="toast-body"><i class="bi bi-bell me-2"></i>{{t.text}}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="dismiss(t.id)"></button>
      </div>
    </div>
  </div>
  `,
  styles: [``]
})
export class ToastsComponent {
  private toast = inject(ToastService);
  list = computed(() => this.toast.toasts());
  dismiss = (id: number) => this.toast.dismiss(id);
}
