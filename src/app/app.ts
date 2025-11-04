// src/app/app.ts
import { Component, signal, inject } from '@angular/core';
import { SessionWatcherService } from './core/auth/session-watcher.service.ts';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from './shared/components/toasts/toasts.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('evaas-interface');
}
