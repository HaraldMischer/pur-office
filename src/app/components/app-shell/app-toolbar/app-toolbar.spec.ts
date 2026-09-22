// pur-office/src/app/components/app-shell/app-toolbar/app-toolbar.spec.ts

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LoadingService } from '../../../services/core/loading.service';
import { StoreSnapshotService } from '../../../services/core/store-snapshot.service';
import { ThemeService } from '../../../services/core/theme.service';
import { BenutzerStore } from '../../../stores/app/benutzer.store';
import { AppToolbar } from './app-toolbar';

describe('AppToolbar', () => {
  let benutzerStoreMock: {
    logout: ReturnType<typeof vi.fn>;
  };
  let themeServiceMock: {
    themeIcon: ReturnType<typeof vi.fn>;
    toggleThemeMode: ReturnType<typeof vi.fn>;
  };
  let storeSnapshotServiceMock: {
    logStoreSnapshots: ReturnType<typeof vi.fn>;
  };
  const isLoading = signal(false);

  beforeEach(async () => {
    benutzerStoreMock = {
      logout: vi.fn().mockResolvedValue(undefined),
    };
    themeServiceMock = {
      themeIcon: vi.fn().mockReturnValue('dark_mode'),
      toggleThemeMode: vi.fn(),
    };
    storeSnapshotServiceMock = {
      logStoreSnapshots: vi.fn(),
    };
    isLoading.set(false);

    await TestBed.configureTestingModule({
      imports: [AppToolbar],
      providers: [
        provideRouter([]),
        { provide: BenutzerStore, useValue: benutzerStoreMock },
        { provide: LoadingService, useValue: { isLoading } },
        { provide: StoreSnapshotService, useValue: storeSnapshotServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    }).compileComponents();
  });

  it('should render the current route title', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.componentRef.setInput('title', 'Systemverwaltung');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-toolbar__title')?.textContent).toContain(
      'Systemverwaltung',
    );
  });

  it('should show the global progress bar while data is loading', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeNull();

    isLoading.set(true);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).not.toBeNull();
    expect(progressBar?.getAttribute('aria-label')).toBe('Daten werden geladen');
  });

  it('should render and toggle the theme mode', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const themeButton = compiled.querySelector<HTMLButtonElement>(
      '[aria-label="Theme umschalten"]',
    );

    expect(themeButton?.textContent).toContain('dark_mode');

    themeButton?.click();

    expect(themeServiceMock.toggleThemeMode).toHaveBeenCalledOnce();
  });

  it('should render the menu icon when the sidenav is closed', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('[aria-label="Hauptnavigation umschalten"]')?.textContent,
    ).toContain('menu');
  });

  it('should hide the navigation toggle when navigation is not available', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.componentRef.setInput('navigationVisible', false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[aria-label="Hauptnavigation umschalten"]')).toBeNull();
  });

  it('should render the product brand with its icon', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.componentRef.setInput('title', 'Pur Office');
    fixture.componentRef.setInput('brandVisible', true);
    fixture.componentRef.setInput('navigationVisible', false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-toolbar__brand-icon')?.textContent).toContain('business');
    expect(compiled.querySelector('.app-toolbar__title--brand')?.textContent).toContain(
      'Pur Office',
    );
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

  it('should hide the store snapshot action for unauthenticated users', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[aria-label="Store-Snapshots protokollieren"]')).toBeNull();
  });

  it('should log store snapshots for authenticated users in development mode', () => {
    const fixture = TestBed.createComponent(AppToolbar);
    fixture.componentRef.setInput('isAuthenticated', true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled
      .querySelector<HTMLButtonElement>('[aria-label="Store-Snapshots protokollieren"]')
      ?.click();

    expect(storeSnapshotServiceMock.logStoreSnapshots).toHaveBeenCalledOnce();
  });
});
