// src/app/features/auth/register/register.component.ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
  <div class="container py-5" style="max-width:460px">
    <h1 class="h4 mb-4">Crear cuenta</h1>
    <form [formGroup]="form" class="vstack gap-3">
      <input formControlName="name" class="form-control" placeholder="Nombre" />
      <input formControlName="email" type="email" class="form-control" placeholder="Email" />
      <input formControlName="password" type="password" class="form-control" placeholder="Contraseña" />
      <button class="btn-ev w-100" [disabled]="form.invalid">Registrarme</button>
    </form>
  </div>
  `,
  styles: [``]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
}
