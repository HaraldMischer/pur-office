// pur-office/src/app/guards/bereich.guard.spec.ts

import { User } from '@angular/fire/auth';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../services/firebase/auth.service';
import { BenutzerService } from '../services/firebase/benutzer.service';
import { bereichGuard } from './bereich.guard';

describe('bereichGuard', () => {
  let authServiceMock: {
    getAuthState: ReturnType<typeof vi.fn>;
  };
  let benutzerServiceMock: {
    getBenutzerProfil: ReturnType<typeof vi.fn>;
  };
  let routerMock: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      getAuthState: vi.fn(),
    };
    benutzerServiceMock = {
      getBenutzerProfil: vi.fn(),
    };
    routerMock = {
      createUrlTree: vi.fn().mockReturnValue({} as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: BenutzerService, useValue: benutzerServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should allow access to an area listed in the user profile', async () => {
    authServiceMock.getAuthState.mockReturnValue(of({ uid: 'benutzer-123' } as User));
    benutzerServiceMock.getBenutzerProfil.mockResolvedValue({
      uid: 'benutzer-123',
      email: 'test@example.com',
      anzeigename: 'Test',
      aktiv: true,
      userRole: 'office',
      erlaubteBereiche: ['dashboard'],
      zugriffe: [],
    });

    const result = await TestBed.runInInjectionContext(() =>
      bereichGuard(
        { data: { bereich: 'dashboard' } } as unknown as ActivatedRouteSnapshot,
        {} as never,
      ),
    );

    expect(result).toBe(true);
  });

  it('should redirect to dashboard when the area is not listed in the user profile', async () => {
    const dashboardUrlTree = {} as UrlTree;
    authServiceMock.getAuthState.mockReturnValue(of({ uid: 'benutzer-123' } as User));
    benutzerServiceMock.getBenutzerProfil.mockResolvedValue({
      uid: 'benutzer-123',
      email: 'test@example.com',
      anzeigename: 'Test',
      aktiv: true,
      userRole: 'filiale',
      erlaubteBereiche: ['dashboard'],
      zugriffe: [],
    });
    routerMock.createUrlTree.mockReturnValue(dashboardUrlTree);

    const result = await TestBed.runInInjectionContext(() =>
      bereichGuard(
        { data: { bereich: 'mitarbeiter' } } as unknown as ActivatedRouteSnapshot,
        {} as never,
      ),
    );

    expect(result).toBe(dashboardUrlTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should redirect to login when no user is signed in', async () => {
    const loginUrlTree = {} as UrlTree;
    authServiceMock.getAuthState.mockReturnValue(of(null));
    routerMock.createUrlTree.mockReturnValue(loginUrlTree);

    const result = await TestBed.runInInjectionContext(() =>
      bereichGuard(
        { data: { bereich: 'dashboard' } } as unknown as ActivatedRouteSnapshot,
        {} as never,
      ),
    );

    expect(result).toBe(loginUrlTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login when the user profile is inactive', async () => {
    const loginUrlTree = {} as UrlTree;
    authServiceMock.getAuthState.mockReturnValue(of({ uid: 'benutzer-123' } as User));
    benutzerServiceMock.getBenutzerProfil.mockResolvedValue({
      uid: 'benutzer-123',
      email: 'test@example.com',
      anzeigename: 'Test',
      aktiv: false,
      userRole: 'office',
      erlaubteBereiche: [],
      zugriffe: [],
    });
    routerMock.createUrlTree.mockReturnValue(loginUrlTree);

    const result = await TestBed.runInInjectionContext(() =>
      bereichGuard(
        { data: { bereich: 'dashboard' } } as unknown as ActivatedRouteSnapshot,
        {} as never,
      ),
    );

    expect(result).toBe(loginUrlTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
