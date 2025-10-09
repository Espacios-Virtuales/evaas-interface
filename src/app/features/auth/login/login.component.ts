// src/app/features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  justRegistered = signal(false);
  registeredEmail = signal<string | null>(null);

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      this.justRegistered.set(params.get('registered') === '1');
      this.registeredEmail.set(params.get('email'));
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Login', this.form.value);
    }
  }
}
