import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { HasRoleDirective } from '../../../core/auth/directives/has-role';
import { AuthFacade } from '../../../core/auth/auth.facade'; 
import { UserSession } from '../../../core/models/auth.model';
import { PATHS } from '../../../utils/paths';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule, HasRoleDirective],
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
})
export class DashboardShellComponent {
  private readonly authfacade = inject(AuthFacade);
  private readonly auth = inject(AuthService);

  readonly dashboardLink = ['/', PATHS.dashboard];
  readonly resourcesLink = ['/', PATHS.dashboard, 'resources'];
  readonly projectsLink = ['/', PATHS.dashboard, 'projects'];
  
  isSidebarOpen = signal(true);
  toggleSidebar() { this.isSidebarOpen.update(v => !v); }

  session = computed<UserSession | null>(() => this.auth.getSession());
  email = computed(() => this.session()?.email ?? null);
  primaryRole = computed(() => this.session()?.roles?.[0] ?? null);


  connectedAt = computed<Date | null>(() => {
    const s = this.session();
    if (!s) return null;
    return s.loginAt ?? s.refreshExp ?? null;
  });

  formatDate(d: Date | null): string {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return '—';
    }
  }

  openUserModal() {
    (document.getElementById('userDlg') as HTMLDialogElement | null)?.showModal();
  }
  closeUserModal() {
    (document.getElementById('userDlg') as HTMLDialogElement | null)?.close();
  }

  logout() {
    this.authfacade.logout();
  }
}
