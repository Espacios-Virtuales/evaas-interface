// src/app/features/dashboard/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  template: `
  <div class="container-xxl py-4">
    <div class="row g-3">
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card ev-card h-100">
          <div class="card-body">
            <div class="card-title h6 mb-1">Clientes</div>
            <div class="display-6 fw-bold">12</div>
            <small class="text-muted">+2 esta semana</small>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card ev-card h-100">
          <div class="card-body">
            <div class="card-title h6 mb-1">Recursos activos</div>
            <div class="display-6 fw-bold">37</div>
            <small class="text-muted">últimas 24 h</small>
          </div>
        </div>
      </div>
      <div class="col-12 col-xl-6">
        <div class="card ev-card h-100">
          <div class="card-body">
            <div class="card-title h6 mb-3">Actividad</div>
            <div class="placeholder-glow">
              <span class="placeholder col-12 mb-2"></span>
              <span class="placeholder col-10 mb-2"></span>
              <span class="placeholder col-8"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
})
export class HomeComponent {}
