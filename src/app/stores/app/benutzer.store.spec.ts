// pur-office/src/app/stores/app/benutzer.store.spec.ts

import { TestBed } from '@angular/core/testing';
import { UserCredential } from '@angular/fire/auth';

import { IBenutzerProfilDokument } from '../../commons/models/domain/benutzer';
import { DebugLogService } from '../../services/core/debug-log.service';
import { AuthService } from '../../services/firebase/auth.service';
import { BenutzerService } from '../../services/domain/benutzer.service';
import { BenutzerStore } from './benutzer.store';
import { StammdatenStore } from './stammdaten.store';

describe('BenutzerStore', () => {
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    getAuthState: ReturnType<typeof vi.fn>;
  };
  let benutzerServiceMock: {
    getBenutzerProfil: ReturnType<typeof vi.fn>;
  };
  let stammdatenStoreMock: {
    isLoaded: ReturnType<typeof vi.fn>;
    loadStammdaten: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
  };
  let debugLogServiceMock: {
    log: ReturnType<typeof vi.fn>;
    logDatenflussTitel: ReturnType<typeof vi.fn>;
    logDatenGeladen: ReturnType<typeof vi.fn>;
  };
  let profil: IBenutzerProfilDokument;

  beforeEach(() => {
    profil = {
      anzeigename: 'Test',
      email: 'test@example.com',
      aktiv: true,
      userRole: 'office',
      erlaubteBereiche: ['dashboard', 'schichtplan'],
      zugriffe: { 'u-1': { 'firma-1': ['filiale-1', 'filiale-2'] } },
    };
    authServiceMock = {
      login: vi.fn().mockResolvedValue({ user: { uid: 'benutzer-123' } } as UserCredential),
      logout: vi.fn().mockResolvedValue(undefined),
      getAuthState: vi.fn(),
    };
    benutzerServiceMock = {
      getBenutzerProfil: vi.fn().mockResolvedValue(profil),
    };
    stammdatenStoreMock = {
      isLoaded: vi.fn().mockReturnValue(false),
      loadStammdaten: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn(),
    };
    debugLogServiceMock = {
      log: vi.fn(),
      logDatenflussTitel: vi.fn(),
      logDatenGeladen: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DebugLogService, useValue: debugLogServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: BenutzerService, useValue: benutzerServiceMock },
        { provide: StammdatenStore, useValue: stammdatenStoreMock },
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
    expect(store.zugriffe()).toEqual({});
  });

  it('should provide a complete snapshot', () => {
    const store = TestBed.inject(BenutzerStore);

    expect(store.snapshot()).toEqual({
      benutzerProfil: null,
      isAuthenticated: false,
      inProgress: false,
      error: null,
    });

    store.setBenutzerProfil(profil);

    expect(store.snapshot()).toEqual({
      benutzerProfil: profil,
      isAuthenticated: false,
      inProgress: false,
      error: null,
    });
  });

  it('should login and load the user profile', async () => {
    const store = TestBed.inject(BenutzerStore);

    await store.login('test-master', 'secret-password');

    expect(authServiceMock.login).toHaveBeenCalledWith('test-master', 'secret-password');
    expect(benutzerServiceMock.getBenutzerProfil).toHaveBeenCalledWith('benutzer-123');
    expect(store.isAuthenticated()).toBe(true);
    expect(store.benutzerProfil()).toBe(profil);
    expect(store.isLoggedIn()).toBe(true);
    expect(debugLogServiceMock.logDatenflussTitel).toHaveBeenCalledWith('1. BENUTZERPROFIL ');
    expect(debugLogServiceMock.logDatenGeladen).toHaveBeenCalledWith('Benutzerprofil', 1, profil);
    expect(stammdatenStoreMock.loadStammdaten).toHaveBeenCalledWith('benutzer-123', profil);
  });

  it('should share parallel profile loads and reuse the loaded profile', async () => {
    let resolveProfil!: (value: IBenutzerProfilDokument) => void;
    benutzerServiceMock.getBenutzerProfil.mockReturnValue(
      new Promise<IBenutzerProfilDokument>((resolve) => {
        resolveProfil = resolve;
      }),
    );
    const store = TestBed.inject(BenutzerStore);

    const ersterAuftrag = store.loadBenutzerProfil('benutzer-123');
    const zweiterAuftrag = store.loadBenutzerProfil('benutzer-123');

    expect(ersterAuftrag).toBe(zweiterAuftrag);
    expect(benutzerServiceMock.getBenutzerProfil).toHaveBeenCalledOnce();

    resolveProfil(profil);
    await Promise.all([ersterAuftrag, zweiterAuftrag]);
    await store.loadBenutzerProfil('benutzer-123');

    expect(benutzerServiceMock.getBenutzerProfil).toHaveBeenCalledOnce();
    expect(store.benutzerProfil()).toBe(profil);
  });

  it('should expose permission helpers for areas, companies and branches', () => {
    const store = TestBed.inject(BenutzerStore);

    store.setBenutzerProfil(profil);

    expect(store.darfBereichNutzen('dashboard')).toBe(true);
    expect(store.darfBereichNutzen('mitarbeiter')).toBe(false);
    expect(store.darfFirmaLesen('u-1', 'firma-1')).toBe(true);
    expect(store.darfFirmaLesen('u-1', 'firma-2')).toBe(false);
    expect(store.darfFilialeLesen('u-1', 'firma-1', 'filiale-1')).toBe(true);
    expect(store.darfFilialeLesen('u-1', 'firma-1', 'filiale-9')).toBe(false);

    store.setBenutzerProfil({ ...profil, userRole: 'master' });

    expect(store.istMaster()).toBe(true);
  });

  it('should logout and clear the user profile', async () => {
    const store = TestBed.inject(BenutzerStore);
    store.setBenutzerProfil(profil);

    await store.logout();

    expect(authServiceMock.logout).toHaveBeenCalledOnce();
    expect(stammdatenStoreMock.reset).toHaveBeenCalled();
    expect(store.benutzerProfil()).toBeNull();
  });

  it('should store a friendly error when login fails', async () => {
    authServiceMock.login.mockRejectedValue({ code: 'auth/invalid-credential' });
    const store = TestBed.inject(BenutzerStore);

    await expect(store.login('test-master', 'wrong-password')).rejects.toEqual({
      code: 'auth/invalid-credential',
    });

    expect(store.error()).toBe('Anmeldename oder Passwort ist nicht korrekt.');
    expect(store.inProgress()).toBe(false);
  });
  it('should separate identical company IDs by entrepreneur and deny inactive profiles', () => {
    const store = TestBed.inject(BenutzerStore);
    store.setBenutzerProfil(profil);
    expect(store.darfFirmaLesen('u-2', 'firma-1')).toBe(false);
    expect(store.darfFilialeLesen('u-2', 'firma-1', 'filiale-1')).toBe(false);
    store.setBenutzerProfil({ ...profil, aktiv: false });
    expect(store.darfFirmaLesen('u-1', 'firma-1')).toBe(false);
    expect(store.darfFilialeLesen('u-1', 'firma-1', 'filiale-1')).toBe(false);
  });

  it('should deny incomplete access maps', () => {
    const store = TestBed.inject(BenutzerStore);
    store.setBenutzerProfil({
      ...profil,
      zugriffe: {},
    });
    expect(store.isLoggedIn()).toBe(true);
    expect(store.darfBereichNutzen('dashboard')).toBe(true);
    expect(store.darfFirmaLesen('u-1', 'firma-1')).toBe(false);
    expect(store.darfFilialeLesen('u-1', 'firma-1', 'filiale-1')).toBe(false);
  });

  it('should deny company access for an empty branch list', () => {
    const store = TestBed.inject(BenutzerStore);
    store.setBenutzerProfil({ ...profil, zugriffe: { 'u-1': { 'firma-1': [] } } });
    expect(store.darfFirmaLesen('u-1', 'firma-1')).toBe(false);
  });
  it('allows an active master to read every company and branch with empty scopes', () => {
    const store = TestBed.inject(BenutzerStore);
    store.setBenutzerProfil({ ...profil, userRole: 'master', zugriffe: {} });
    expect(store.darfFirmaLesen('beliebig', 'beliebig')).toBe(true);
    expect(store.darfFilialeLesen('beliebig', 'beliebig', 'beliebig')).toBe(true);
    store.setBenutzerProfil({ ...profil, userRole: 'master', aktiv: false, zugriffe: {} });
    expect(store.darfFirmaLesen('beliebig', 'beliebig')).toBe(false);
    expect(store.darfFilialeLesen('beliebig', 'beliebig', 'beliebig')).toBe(false);
  });

  it.each(['office', 'filiale'] as const)('denies empty scopes for %s', (userRole) => {
    const store = TestBed.inject(BenutzerStore);
    store.setBenutzerProfil({ ...profil, userRole, zugriffe: {} });
    expect(store.darfFirmaLesen('u-1', 'firma-1')).toBe(false);
    expect(store.darfFilialeLesen('u-1', 'firma-1', 'filiale-1')).toBe(false);
  });
});
