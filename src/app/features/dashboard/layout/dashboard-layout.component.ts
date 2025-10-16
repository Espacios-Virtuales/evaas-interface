// src/app/features/dashboard/layout/dashboard-layout.component.ts
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
  <div class="container py-3">
    <nav class="d-flex align-items-center gap-3 mb-3">
      <a routerLink="/dashboard" class="text-decoration-none">Home</a>

      <div class="ms-auto d-flex align-items-center gap-3">
        <small class="text-muted" *ngIf="auth.userSig() as user">
          <span class="me-2">Hola, {{ user }}</span>
        </small>
        <button class="btn btn-sm btn-outline-secondary" (click)="logout()">
          Salir
        </button>
      </div>
    </nav>
    <router-outlet></router-outlet>
  </div>
  `,
})
export class DashboardLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
