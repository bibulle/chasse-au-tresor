import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const socketConfig: SocketIoConfig = {
  url: '',
  options: {
    reconnection: true, // Activer la reconnexion automatique
    reconnectionAttempts: 5, // Limiter le nombre de tentatives
    reconnectionDelay: 3000, // Délai entre chaque tentative (en ms)
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    importProvidersFrom(SocketIoModule.forRoot(socketConfig)),
    importProvidersFrom(ToastrModule.forRoot({
      timeOut: 3000, 
      positionClass: 'toast-top-right', 
      preventDuplicates: true, 
      enableHtml: true
    })),
    importProvidersFrom(BrowserAnimationsModule)

  ],
};
