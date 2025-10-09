// src/app/features/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
  <div class="container py-5" style="max-width:460px">
    <h1 class="h4 mb-4">Ingresar</h1>
    <form [formGroup]="form" class="vstack gap-3">
      <input formControlName="email" type="email" class="form-control" placeholder="Email" />
      <input formControlName="password" type="password" class="form-control" placeholder="Contraseña" />
      <button class="btn-ev w-100" [disabled]="form.invalid">Entrar</button>
    </form>
  </div>
  `,
  styles: [``]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
}
