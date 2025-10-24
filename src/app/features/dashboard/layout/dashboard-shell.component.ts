// src/app/features/dashboard/layout/dashboard-layout.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { HasRoleDirective } from '../../../core/auth/directives/has-role';
import { AuthFacade } from '../../../core/auth/auth.facade'; 
import { UserSession } from '../../../core/models/auth..model';


@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule, HasRoleDirective],
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
})
export class DashboardShellComponent {
  authfacade = inject(AuthFacade);
  auth = inject(AuthService); 
  
  // UI
  isSidebarOpen = signal(true);
  toggleSidebar() { this.isSidebarOpen.update(v => !v); }

  // 1) Sesión como computed (toma del servicio actual)
  session = computed<UserSession | null>(() => this.auth.getSession());
  
  // 2) Campos derivados que pediste (email, role principal, hora de conexión)
  email = computed(() => this.session()?.email ?? null);
  
  /** Role “principal” (primer rol) — ajusta a lo que prefieras mostrar */
  primaryRole = computed(() => this.session()?.roles?.[0] ?? null);


  /** Hora de conexión (loginAt). Si no existe, fallback a refreshExp (no ideal pero informativo) */
  connectedAt = computed<Date | null>(() => {
    const s = this.session();
    if (!s) return null;
    return s.loginAt ?? s.refreshExp ?? null;
  });

  // Utilidad opcional para formatear fecha en plantilla
  formatDate(d: Date | null): string {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return '—';
    }
  }

  // Abrir/cerrar <dialog> nativo
  openUserModal() {
    (document.getElementById('userDlg') as HTMLDialogElement | null)?.showModal();
  }
  closeUserModal() {
    (document.getElementById('userDlg') as HTMLDialogElement | null)?.close();
  }

  // logout facade
  logout() {
    this.authfacade.logout();
  }
}
