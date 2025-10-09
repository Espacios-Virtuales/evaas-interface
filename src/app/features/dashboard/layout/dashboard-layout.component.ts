// src/app/features/dashboard/layout/dashboard-layout.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
  <div class="container py-3">
    <nav class="d-flex gap-3 mb-3">
      <a routerLink="/dashboard" class="text-decoration-none">Home</a>
      <!-- <a routerLink="/dashboard/reports" class="text-decoration-none">Reports</a> -->
      <a routerLink="/login" class="ms-auto text-decoration-none">Salir</a>
    </nav>
    <router-outlet></router-outlet>
  </div>
  `,
})
export class DashboardLayoutComponent {}
