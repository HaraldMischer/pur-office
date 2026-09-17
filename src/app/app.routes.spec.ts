// pur-office/src/app/app.routes.spec.ts

import { authGuard } from './guards/auth.guard';
import { bereichGuard } from './guards/bereich.guard';
import { masterGuard } from './guards/master.guard';
import { routes } from './app.routes';

describe('app routes', () => {
  it('should protect the password route by authentication', () => {
    const passwordRoute = routes.find((route) => route.path === 'konto/passwort');

    expect(passwordRoute).toBeDefined();
    expect(passwordRoute?.canActivate).toEqual([authGuard]);
    expect(passwordRoute?.loadComponent).toBeDefined();
  });

  it('should protect the administration route by area and master role', () => {
    const verwaltungRoute = routes.find((route) => route.path === 'verwaltung');

    expect(verwaltungRoute).toBeDefined();
    expect(verwaltungRoute?.data?.['bereich']).toBe('verwaltung');
    expect(verwaltungRoute?.canActivate).toEqual([authGuard, bereichGuard, masterGuard]);
    expect(verwaltungRoute?.loadComponent).toBeDefined();
  });
});
