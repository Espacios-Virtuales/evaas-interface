// src/app/features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthRequest } from '../../../core/models/http';

// Helper para tipar el formulario reactivo
type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  submitting = signal(false);
  serverError = signal<string | null>(null);

  form = this.fb.group<LoginForm>({
    email: this.fb.nonNullable.control('', { validators:[Validators.required, Validators.email] }),
    password: this.fb.nonNullable.control('', { validators:[Validators.required, Validators.minLength(6)] }),
  });

  justRegistered = signal(false);
  get f() { return this.form.controls; }

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      this.justRegistered.set(params.get('registered') === '1');
    });
  }
    

  private extractErrorMessage(err: any): string {
    if (!err) return 'Error desconocido.';
    // intenta backend → HttpErrorResponse → texto
    return err?.error?.message ?? err?.message ?? 'Credenciales incorrectas.';
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);

    const payload: AuthRequest = this.form.getRawValue(); // <- strings no-null
    this.auth.login(payload).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: unknown) => {
        const msg = (err as any)?.error?.message ?? (err as any)?.message ?? 'Credenciales incorrectas.';
        this.serverError.set(msg);
        this.submitting.set(false);
      },
    });
  }

}
