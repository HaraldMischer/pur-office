// pur-office/src/app/app.spec.ts

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BenutzerStore } from './stores/app/benutzer.store';
import { App } from './app';

describe('App', () => {
  let benutzerStoreMock: {
    initAuthState: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    isLoggedIn: ReturnType<typeof vi.fn>;
    inProgress: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    darfBereichNutzen: ReturnType<typeof vi.fn>;
    istMaster: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    benutzerStoreMock = {
      initAuthState: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(false),
      isLoggedIn: vi.fn().mockReturnValue(false),
      inProgress: vi.fn().mockReturnValue(false),
      logout: vi.fn().mockResolvedValue(undefined),
      darfBereichNutzen: vi.fn().mockReturnValue(true),
      istMaster: vi.fn().mockReturnValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [App, NoopAnimationsModule],
      providers: [provideRouter([]), { provide: BenutzerStore, useValue: benutzerStoreMock }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize the auth state', () => {
    TestBed.createComponent(App);

    expect(benutzerStoreMock.initAuthState).toHaveBeenCalledOnce();
  });

  it('should render the app shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('mat-sidenav-container')).toBeTruthy();
    expect(compiled.querySelector('app-toolbar')).toBeTruthy();
    expect(compiled.querySelector('app-sidenav')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
