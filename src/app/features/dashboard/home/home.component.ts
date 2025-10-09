// src/app/features/dashboard/home/home.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-home',  
  standalone: true,
  template: `
    <div class="container py-5">
      <h2 class="h5">Dashboard</h2>
      <p class="text-muted">Bienvenido 👋</p>
    </div>
  `,
  styles: [``]
})
export class HomeComponent {}
