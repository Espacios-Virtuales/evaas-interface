import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AccessContextStore } from '../../../core/access/access-context.store';
import { dashboardRouteForAuthorities } from '../../../core/auth/role-routing';

@Component({
  selector: 'app-dashboard-context',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-context.component.html',
})
export class DashboardContextComponent implements OnInit {
  private readonly accessContextStore = inject(AccessContextStore);
  private readonly router = inject(Router);

  readonly loading = this.accessContextStore.loading;
  readonly errorMessage = this.accessContextStore.errorMessage;
  readonly context = this.accessContextStore.context;
  readonly hasContextualRoute = computed(() => {
    const context = this.context();
    return !!context?.enabled && dashboardRouteForAuthorities(context.authorities).at(-1) !== 'context';
  });

  ngOnInit(): void {
    this.accessContextStore.load().subscribe({
      next: context => {
        const route = dashboardRouteForAuthorities(context.authorities);
        if (context.enabled && route.at(-1) !== 'context') {
          void this.router.navigate(route);
        }
      },
      error: () => {
        if (this.accessContextStore.errorStatus() === 401) {
          void this.router.navigate(['/login']);
        }
      },
    });
  }
}
