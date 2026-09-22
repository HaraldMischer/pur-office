// pur-office/src/app/app.routes.spec.ts

import { authGuard } from './guards/auth.guard';
import { bereichGuard } from './guards/bereich.guard';
import { masterGuard } from './guards/master.guard';
import { verwaltungGuard } from './guards/verwaltung.guard';
import { routes } from './app.routes';

describe('app routes', () => {
  it('should define titles for all routed pages', () => {
    const expectedTitles = new Map([
      ['login', 'Anmelden'],
      ['dashboard', 'Dashboard'],
      ['schichtplan', 'Schichtplan'],
      ['mitarbeiter', 'Mitarbeiter'],
      ['passwort', 'Passwort ändern'],
      ['verwaltung', 'Verwaltung'],
      ['systemverwaltung', 'Systemverwaltung'],
    ]);

    expectedTitles.forEach((title, path) => {
      expect(routes.find((route) => route.path === path)?.title).toBe(title);
    });
  });

  it('should use the auth layout for the login route', () => {
    const loginRoute = routes.find((route) => route.path === 'login');

    expect(loginRoute?.data?.['layout']).toBe('auth');
  });

  it('should protect the password route by authentication', () => {
    const passwordRoute = routes.find((route) => route.path === 'passwort');

    expect(passwordRoute).toBeDefined();
    expect(passwordRoute?.canActivate).toEqual([authGuard]);
    expect(passwordRoute?.loadComponent).toBeDefined();
  });

  it('should protect the administration route by area and master role', () => {
    const systemverwaltungRoute = routes.find((route) => route.path === 'systemverwaltung');

    expect(systemverwaltungRoute).toBeDefined();
    expect(systemverwaltungRoute?.data?.['bereich']).toBe('systemverwaltung');
    expect(systemverwaltungRoute?.canActivate).toEqual([authGuard, bereichGuard, masterGuard]);
    expect(systemverwaltungRoute?.loadComponent).toBeDefined();
  });

  it('should protect the management route by area and allowed roles', () => {
    const verwaltungRoute = routes.find((route) => route.path === 'verwaltung');

    expect(verwaltungRoute).toBeDefined();
    expect(verwaltungRoute?.data?.['bereich']).toBe('verwaltung');
    expect(verwaltungRoute?.canActivate).toEqual([authGuard, bereichGuard, verwaltungGuard]);
    expect(verwaltungRoute?.loadComponent).toBeDefined();
  });
});
