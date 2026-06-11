import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { PATHS } from '../../../utils/paths';

type ActivationState = 'loading' | 'success' | 'error';
type ResendState = 'idle' | 'loading' | 'success' | 'error' | 'validation';

@Component({
  selector: 'app-account-activation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account-activation.component.html',
  styleUrls: ['./account-activation.component.scss'],
})
export class AccountActivationComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private onboarding = inject(OnboardingService);
  private fb = inject(FormBuilder);
  private activationSub?: Subscription;
  private redirectSub?: Subscription;
  private resendSub?: Subscription;
  private activationStarted = false;

  state = signal<ActivationState>('loading');
  message = signal('Activando tu cuenta...');
  resendState = signal<ResendState>('idle');
  resendMessage = signal<string | null>(null);

  resendForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const code = this.currentActivationCode();

    if (!code) {
      this.state.set('error');
      this.message.set('Código de activación no encontrado.');
      return;
    }

    this.startActivation(code);
  }

  ngOnDestroy(): void {
    this.activationSub?.unsubscribe();
    this.redirectSub?.unsubscribe();
    this.resendSub?.unsubscribe();
  }

  resendActivation(): void {
    this.resendMessage.set(null);

    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      this.resendState.set('validation');
      this.resendMessage.set('Ingresa un correo válido.');
      return;
    }

    this.resendState.set('loading');
    const email = this.resendForm.controls.email.value.trim();

    this.resendSub?.unsubscribe();
    this.resendSub = this.onboarding.resendActivation(email).subscribe({
      next: () => {
        this.resendState.set('success');
        this.resendMessage.set('Si el correo existe y requiere activación, enviaremos un nuevo enlace.');
      },
      error: () => {
        this.resendState.set('error');
        this.resendMessage.set('No pudimos reenviar el correo de activación. Intenta nuevamente.');
      },
    });
  }

  private startActivation(code: string): void {
    if (this.activationStarted) return;
    this.activationStarted = true;
    this.state.set('loading');
    this.message.set('Activando tu cuenta...');

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

  private currentActivationCode(): string | null {
    const tree = this.router.parseUrl(this.router.url);
    return tree.queryParams['code']?.trim() || null;
  }

  private showActivationError(): void {
    this.state.set('error');
    this.message.set('El enlace puede haber expirado, ya fue utilizado o no es válido.');
  }
}
