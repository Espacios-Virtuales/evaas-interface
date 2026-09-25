import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthFacade } from '../../../core/auth/auth.facade';
import { AuthStore } from '../../../core/auth/auth.store';
import { AccessContextStore } from '../../../core/access/access-context.store';
import { DASHBOARD_NAV_ITEMS } from './dashboard-nav';
import { dashboardRouteForAuthorities } from '../../../core/auth/role-routing';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
})
export class DashboardShellComponent {
  private readonly authfacade = inject(AuthFacade);
  private readonly authStore = inject(AuthStore);
  private readonly accessContextStore = inject(AccessContextStore);
  private readonly mobileMediaQuery = '(max-width: 768px)';

  readonly dashboardLink = computed(() =>
    dashboardRouteForAuthorities(this.accessContextStore.context()?.authorities ?? []),
  );
  
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

  readonly email = computed(() => this.accessContextStore.context()?.email ?? null);
  readonly authorities = computed(() => this.accessContextStore.context()?.authorities ?? []);
  readonly primaryRole = computed(() => this.authorities()[0] ?? null);
  navItems = computed(() => {
    const authorities = this.authorities();
    return DASHBOARD_NAV_ITEMS.filter(item =>
      item.enabled !== false && item.roles.some(role => authorities.includes(role)),
    );
  });


  connectedAt = computed<Date | null>(() => {
    const s = this.authStore.session();
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

  constructor() {
    this.accessContextStore.load().subscribe({ error: () => undefined });
  }

  private matchesMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia(this.mobileMediaQuery).matches;
  }
}
