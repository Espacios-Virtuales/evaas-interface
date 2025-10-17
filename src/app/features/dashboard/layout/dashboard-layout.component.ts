// src/app/features/dashboard/layout/dashboard-layout.component.ts
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth';
import { Router } from '@angular/router';
import { HasRoleDirective } from '../../../core/auth/directives/has-role';


@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule, HasRoleDirective],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
