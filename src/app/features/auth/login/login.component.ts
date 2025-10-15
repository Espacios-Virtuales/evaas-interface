// src/app/features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AuthRequest } from '../../../core/models/index';

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
    
  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);

    const payload: AuthRequest = this.form.getRawValue(); // <- strings no-null
    this.auth.login(payload).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.serverError.set(err?.error?.message || 'Credenciales incorrectas.');
        this.submitting.set(false);
      },
    });
  }

}
