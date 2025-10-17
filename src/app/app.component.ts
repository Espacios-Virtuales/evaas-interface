// src/app/app.component.ts
import { Component, inject } from '@angular/core';
import { SessionWatcherService } from './core/auth/session-watcher.service.ts';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<router-outlet />`,
  imports: [RouterOutlet]
})
export class AppComponent {
  // tocar el servicio para forzar su construcción en el boot:
  private _watcher = inject(SessionWatcherService);
}
