// pur-office/src/app/pages/auth/passwort-page/passwort-page.spec.ts

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../../services/firebase/auth.service';
import { PasswortPage } from './passwort-page';

describe('PasswortPage', () => {
  let authServiceMock: { changePassword: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceMock = { changePassword: vi.fn().mockResolvedValue(undefined) };
    await TestBed.configureTestingModule({
      imports: [PasswortPage, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();
  });

  it('should require all password fields', () => {
    const fixture = TestBed.createComponent(PasswortPage);
    expect(fixture.componentInstance.passwortForm.invalid).toBe(true);
  });

  it('should reject different new passwords', () => {
    const fixture = TestBed.createComponent(PasswortPage);
    fixture.componentInstance.passwortForm.setValue({
      aktuellesPasswort: 'altes-passwort',
      neuesPasswort: 'neues-passwort',
      passwortBestaetigung: 'anderes-passwort',
    });

    expect(fixture.componentInstance.passwortForm.hasError('passwoerterUngleich')).toBe(true);
  });

  it('should change the password for a valid form', async () => {
    const fixture = TestBed.createComponent(PasswortPage);
    fixture.componentInstance.passwortForm.setValue({
      aktuellesPasswort: 'altes-passwort',
      neuesPasswort: 'neues-passwort',
      passwortBestaetigung: 'neues-passwort',
    });

    await fixture.componentInstance.onSubmit();

    expect(authServiceMock.changePassword).toHaveBeenCalledWith('altes-passwort', 'neues-passwort');
    expect(fixture.componentInstance.passwortStore.erfolgreich()).toBe(true);
  });
});
