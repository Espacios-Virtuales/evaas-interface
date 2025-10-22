// src/app/app.ts
import { Component, signal, inject } from '@angular/core';
import { SessionWatcherService } from './core/auth/session-watcher.service.ts';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('evaas-interface');
}
