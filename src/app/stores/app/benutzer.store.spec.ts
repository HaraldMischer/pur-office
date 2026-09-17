// pur-office/src/app/stores/app/benutzer.store.spec.ts

import { TestBed } from '@angular/core/testing';
import { UserCredential } from '@angular/fire/auth';

import { IBenutzerDokument } from '../../commons/models/domain/benutzer';
import { AuthService } from '../../services/firebase/auth.service';
import { BenutzerService } from '../../services/firebase/benutzer.service';
import { BenutzerStore } from './benutzer.store';

describe('BenutzerStore', () => {
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    getAuthState: ReturnType<typeof vi.fn>;
  };
  let benutzerServiceMock: {
    getBenutzerProfil: ReturnType<typeof vi.fn>;
  };
  let profil: IBenutzerDokument;

  beforeEach(() => {
    profil = {
      uid: 'benutzer-123',
      anzeigename: 'Test',
      email: 'test@example.com',
      aktiv: true,
      userRole: 'office',
      erlaubteBereiche: ['dashboard', 'schichtplan'],
      zugriffe: [
        {
          firmaId: 'firma-1',
          filialIds: ['filiale-1', 'filiale-2'],
        },
      ],
    };
    authServiceMock = {
      login: vi.fn().mockResolvedValue({ user: { uid: 'benutzer-123' } } as UserCredential),
      logout: vi.fn().mockResolvedValue(undefined),
      getAuthState: vi.fn(),
    };
    benutzerServiceMock = {
      getBenutzerProfil: vi.fn().mockResolvedValue(profil),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: BenutzerService, useValue: benutzerServiceMock },
      ],
    });
  });

  it('should start with an empty state', () => {
    const store = TestBed.inject(BenutzerStore);

    expect(store.benutzerProfil()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.inProgress()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.isLoggedIn()).toBe(false);
    expect(store.istMaster()).toBe(false);
  });

  it('should login and load the user profile', async () => {
    const store = TestBed.inject(BenutzerStore);

    await store.login('test@example.com', 'secret-password');

    expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', 'secret-password');
    expect(benutzerServiceMock.getBenutzerProfil).toHaveBeenCalledWith('benutzer-123');
    expect(store.isAuthenticated()).toBe(true);
    expect(store.benutzerProfil()).toBe(profil);
    expect(store.isLoggedIn()).toBe(true);
  });

  it('should expose permission helpers for areas, companies and branches', () => {
    const store = TestBed.inject(BenutzerStore);

    store.setBenutzerProfil(profil);

    expect(store.darfBereichNutzen('dashboard')).toBe(true);
    expect(store.darfBereichNutzen('mitarbeiter')).toBe(false);
    expect(store.darfFirmaLesen('firma-1')).toBe(true);
    expect(store.darfFirmaLesen('firma-2')).toBe(false);
    expect(store.darfFilialeLesen('firma-1', 'filiale-1')).toBe(true);
    expect(store.darfFilialeLesen('firma-1', 'filiale-9')).toBe(false);

    store.setBenutzerProfil({ ...profil, userRole: 'master' });

    expect(store.istMaster()).toBe(true);
  });

  it('should logout and clear the user profile', async () => {
    const store = TestBed.inject(BenutzerStore);
    store.setBenutzerProfil(profil);

    await store.logout();

    expect(authServiceMock.logout).toHaveBeenCalledOnce();
    expect(store.benutzerProfil()).toBeNull();
  });

  it('should store a friendly error when login fails', async () => {
    authServiceMock.login.mockRejectedValue({ code: 'auth/invalid-credential' });
    const store = TestBed.inject(BenutzerStore);

    await expect(store.login('test@example.com', 'wrong-password')).rejects.toEqual({
      code: 'auth/invalid-credential',
    });

    expect(store.error()).toBe('E-Mail-Adresse oder Passwort ist nicht korrekt.');
    expect(store.inProgress()).toBe(false);
  });
});
