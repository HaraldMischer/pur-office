// pur-office/src/app/components/app-shell/app-toolbar/app-toolbar.spec.ts

import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { BenutzerStore } from '../../../stores/app/benutzer.store';
import { AppToolbar } from './app-toolbar';

describe('AppToolbar', () => {
  let benutzerStoreMock: {
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    benutzerStoreMock = {
      logout: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [AppToolbar],
      providers: [provideRouter([]), { provide: BenutzerStore, useValue: benutzerStoreMock }],
    }).compileComponents();
  });

  it('should render the app title', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-toolbar__title')?.textContent).toContain('Pur Office');
  });

  it('should render the menu icon when the sidenav is closed', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('[aria-label="Hauptnavigation umschalten"]')?.textContent,
    ).toContain('menu');
  });

  it('should render the back icon when the sidenav is open', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.componentRef.setInput('sidenavOpened', true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('[aria-label="Hauptnavigation umschalten"]')?.textContent,
    ).toContain('arrow_back_ios');
  });

  it('should emit the navigation toggle event', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    const toolbar = fixture.componentInstance;
    const navigationToggleSpy = vi.fn();
    toolbar.navigationToggle.subscribe(navigationToggleSpy);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('[aria-label="Hauptnavigation umschalten"]')?.click();

    expect(navigationToggleSpy).toHaveBeenCalledOnce();
  });

  it('should render the auth and profile status', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Auth: offen');
    expect(compiled.textContent).toContain('Profil: fehlt');

    fixture.componentRef.setInput('isAuthenticated', true);
    fixture.componentRef.setInput('isLoggedIn', true);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Auth: eingeloggt');
    expect(compiled.textContent).toContain('Profil: geladen');
  });

  it('should logout through the store and navigate to login when authenticated', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.componentRef.setInput('isAuthenticated', true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('[aria-label="Abmelden"]')?.click();
    await fixture.whenStable();

    expect(benutzerStoreMock.logout).toHaveBeenCalledOnce();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should render a password link for authenticated users', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.componentRef.setInput('isAuthenticated', true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector<HTMLAnchorElement>('[aria-label="Passwort ändern"]');

    expect(link?.getAttribute('href')).toBe('/passwort');
  });
});
