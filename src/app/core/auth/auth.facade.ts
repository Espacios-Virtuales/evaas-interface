// src/app/core/auth/auth.facade.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { of, finalize, catchError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private api = inject(AuthService);
  private store = inject(AuthStore);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private loggingOut = false;

  logout(reason = 'Sesión finalizada.') {
    if (this.loggingOut) return;
    this.loggingOut = true;

    const s = this.store.session();
    const refreshToken = s?.refreshToken ?? null;

    this.api.logout(refreshToken).pipe(
      catchError(() => of(void 0)),
      finalize(() => {
        this.store.clear();
        this.loggingOut = false;

        this.router.navigate(['/login'], { queryParams: { reason } })
          .then(() => this.snack.open(reason, 'OK', { duration: 3000, panelClass: ['snack-info'] }));
      })
    ).subscribe();
  }
}
