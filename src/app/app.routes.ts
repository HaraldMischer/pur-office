import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { bereichGuard } from './guards/bereich.guard';
import { masterGuard } from './guards/master.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, bereichGuard],
    data: { bereich: 'dashboard' },
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'schichtplan',
    canActivate: [authGuard, bereichGuard],
    data: { bereich: 'schichtplan' },
    loadComponent: () =>
      import('./pages/schichtplan-page/schichtplan-page').then((m) => m.SchichtplanPage),
  },
  {
    path: 'mitarbeiter',
    canActivate: [authGuard, bereichGuard],
    data: { bereich: 'mitarbeiter' },
    loadComponent: () =>
      import('./pages/mitarbeiter-page/mitarbeiter-page').then((m) => m.MitarbeiterPage),
  },
  {
    path: 'passwort',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/auth/passwort-page/passwort-page').then((m) => m.PasswortPage),
  },
  {
    path: 'verwaltung',
    canActivate: [authGuard, bereichGuard, masterGuard],
    data: { bereich: 'verwaltung' },
    loadComponent: () =>
      import('./pages/verwaltung-page/verwaltung-page').then((m) => m.VerwaltungPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
