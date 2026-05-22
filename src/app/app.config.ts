// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, inject, provideEnvironmentInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth-interceptor';
import { errorInterceptor } from './core/http/error-interceptor';
import { refreshTokenInterceptor } from './core/http/refresh-token-interceptor';
import { SessionWatcherService } from './core/auth/session-watcher.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      authInterceptor,
      errorInterceptor,   
      refreshTokenInterceptor 
    ])),
    importProvidersFrom(MatSnackBarModule),

    provideEnvironmentInitializer(() => {
      inject(SessionWatcherService);
    }),
  ]
};
