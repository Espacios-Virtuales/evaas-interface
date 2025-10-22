// src/app/features/auth/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterRequest } from '../../../core/models/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  submitting = signal(false);
  submitted = false;                // ← NUEVO
  serverError = signal<string | null>(null);

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
  });

  get f() { return this.form.controls; }

  showError(name: keyof typeof this.f): boolean {
    const c = this.f[name];
    return !!(c && c.invalid && (c.dirty || c.touched || this.submitted));
  }

  onSubmit() {
    this.serverError.set(null);
    this.submitted = true;          // ← marcamos intento de envío

    if (this.form.invalid) {
      this.form.markAllAsTouched(); // ← dispara validación visual
      return;
    }

    this.submitting.set(true);
    const payload: RegisterRequest = {
      firstName: this.f.firstName.value!,
      lastName:  this.f.lastName.value!,
      email:     this.f.email.value!,
      password:  this.f.password.value!
    };
    this.auth.register(payload).subscribe({
      next: (user) => {
        this.router.navigate(['/login'], { queryParams: { registered: '1' } });
      },
      error: (err) => this.serverError.set(err?.error?.message || 'No pudimos completar el registro.'),
      complete: () => this.submitting.set(false)
    });
  }
}