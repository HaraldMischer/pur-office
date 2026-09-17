// pur-office/src/app/pages/auth/login-page/login-page.spec.ts

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { BenutzerStore } from '../../../stores/app/benutzer.store';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let benutzerStoreMock: {
    inProgress: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    darfBereichNutzen: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    benutzerStoreMock = {
      inProgress: vi.fn().mockReturnValue(false),
      error: vi.fn().mockReturnValue(null),
      login: vi.fn().mockResolvedValue(undefined),
      darfBereichNutzen: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage, NoopAnimationsModule],
      providers: [provideRouter([]), { provide: BenutzerStore, useValue: benutzerStoreMock }],
    }).compileComponents();
  });

  it('should provide an invalid empty form initially', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const page = fixture.componentInstance;

    expect(page.loginForm.invalid).toBe(true);
    expect(page.loginForm.controls.email.hasError('required')).toBe(true);
    expect(page.loginForm.controls.password.hasError('required')).toBe(true);
  });

  it('should login and navigate to the dashboard when the form is valid', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LoginPage);
    const page = fixture.componentInstance;

    page.loginForm.setValue({
      email: ' test@example.com ',
      password: 'secret-password',
    });

    await page.submitLogin();

    expect(benutzerStoreMock.login).toHaveBeenCalledWith('test@example.com', 'secret-password');
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should allow the temporary harry-office login value', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LoginPage);
    const page = fixture.componentInstance;

    page.loginForm.setValue({
      email: 'harry-office@pur-software.de',
      password: 'secret-password',
    });

    await page.submitLogin();

    expect(benutzerStoreMock.login).toHaveBeenCalledWith('harry-office@pur-software.de', 'secret-password');
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not login when the form is invalid', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LoginPage);
    const page = fixture.componentInstance;

    await page.submitLogin();

    expect(benutzerStoreMock.login).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(page.loginForm.touched).toBe(true);
  });

  it('should render an error message from the store', () => {
    benutzerStoreMock.error.mockReturnValue('E-Mail-Adresse oder Passwort ist nicht korrekt.');
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.pur-form__error')?.textContent).toContain(
      'E-Mail-Adresse oder Passwort ist nicht korrekt.',
    );
  });
});
