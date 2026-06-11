import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { PATHS } from '../../../utils/paths';

type ActivationState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-account-activation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-activation.component.html',
  styleUrls: ['./account-activation.component.scss'],
})
export class AccountActivationComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private onboarding = inject(OnboardingService);
  private activationSub?: Subscription;
  private redirectSub?: Subscription;

  state = signal<ActivationState>('loading');
  message = signal('Activando tu cuenta...');

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code')?.trim();

    if (!code) {
      this.state.set('error');
      this.message.set('Código de activación no encontrado.');
      return;
    }

    this.activationSub = this.onboarding.activateAccount(code).subscribe({
      next: response => {
        if (response.activated === true) {
          this.state.set('success');
          this.message.set('Cuenta activada exitosamente.');
          this.redirectSub = timer(1200).subscribe(() => {
            this.router.navigateByUrl(`/${PATHS.altaEvaas}`);
          });
          return;
        }

        this.showActivationError();
      },
      error: () => this.showActivationError(),
    });
  }

  ngOnDestroy(): void {
    this.activationSub?.unsubscribe();
    this.redirectSub?.unsubscribe();
  }

  private showActivationError(): void {
    this.state.set('error');
    this.message.set('No pudimos activar tu cuenta. El enlace puede estar vencido o ya utilizado.');
  }
}
