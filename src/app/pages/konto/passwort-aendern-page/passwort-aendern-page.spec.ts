// pur-office/src/app/pages/konto/passwort-aendern-page/passwort-aendern-page.spec.ts

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../../services/firebase/auth.service';
import { PasswortAendernPage } from './passwort-aendern-page';

describe('PasswortAendernPage', () => {
  let authServiceMock: { changePassword: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceMock = { changePassword: vi.fn().mockResolvedValue(undefined) };
    await TestBed.configureTestingModule({
      imports: [PasswortAendernPage, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();
  });

  it('should require all password fields', () => {
    const fixture = TestBed.createComponent(PasswortAendernPage);
    expect(fixture.componentInstance.passwortForm.invalid).toBe(true);
  });

  it('should reject different new passwords', () => {
    const fixture = TestBed.createComponent(PasswortAendernPage);
    fixture.componentInstance.passwortForm.setValue({
      aktuellesPasswort: 'altes-passwort',
      neuesPasswort: 'neues-passwort',
      passwortBestaetigung: 'anderes-passwort',
    });

    expect(fixture.componentInstance.passwortForm.hasError('passwoerterUngleich')).toBe(true);
  });

  it('should change the password for a valid form', async () => {
    const fixture = TestBed.createComponent(PasswortAendernPage);
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
