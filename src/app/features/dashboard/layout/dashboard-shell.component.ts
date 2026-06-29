import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthFacade } from '../../../core/auth/auth.facade'; 
import { UserSession } from '../../../core/models/auth.model';
import { PATHS } from '../../../utils/paths';
import { DASHBOARD_NAV_ITEMS } from './dashboard-nav';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
})
export class DashboardShellComponent {
  private readonly authfacade = inject(AuthFacade);
  private readonly auth = inject(AuthService);
  private readonly mobileMediaQuery = '(max-width: 768px)';

  readonly dashboardLink = ['/', PATHS.dashboard];
  
  readonly isMobileViewport = signal(this.matchesMobileViewport());
  readonly isSidebarOpen = signal(!this.matchesMobileViewport());
  readonly menuButtonLabel = computed(() => this.isSidebarOpen() ? 'Cerrar menú' : 'Abrir menú');

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  closeSidebarAfterNavigation(): void {
    if (this.isMobileViewport()) {
      this.closeSidebar();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const wasMobile = this.isMobileViewport();
    const isMobile = this.matchesMobileViewport();

    if (wasMobile === isMobile) return;

    this.isMobileViewport.set(isMobile);
    this.isSidebarOpen.set(!isMobile);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMobileViewport() && this.isSidebarOpen()) {
      this.closeSidebar();
    }
  }

  session = computed<UserSession | null>(() => this.auth.getSession());
  email = computed(() => this.session()?.email ?? null);
  primaryRole = computed(() => this.session()?.roles?.[0] ?? null);
  navItems = computed(() => {
    const roles = this.session()?.roles ?? [];
    return DASHBOARD_NAV_ITEMS.filter(item =>
      item.enabled !== false && item.roles.some(role => roles.includes(role)),
    );
  });


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

  private matchesMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia(this.mobileMediaQuery).matches;
  }
}
