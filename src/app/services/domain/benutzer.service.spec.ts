// pur-office/src/app/services/domain/benutzer.service.spec.ts

import { TestBed } from '@angular/core/testing';

import {
  IBenutzerProfilAktualisierung,
  IBenutzerProfilDokument,
} from '../../commons/models/domain/benutzer';
import { BenutzerService } from './benutzer.service';
import { FirestoreDbService } from '../firebase/firestore-db.service';

describe('BenutzerService', () => {
  const firestoreDbServiceMock = {
    createServerTimestamp: vi.fn(),
    loadCollection: vi.fn(),
    loadDocument: vi.fn(),
    updateDocument: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreDbServiceMock.loadCollection.mockResolvedValue([]);
    firestoreDbServiceMock.loadDocument.mockResolvedValue(null);
    firestoreDbServiceMock.createServerTimestamp.mockReturnValue('server-timestamp');
    firestoreDbServiceMock.updateDocument.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        BenutzerService,
        { provide: FirestoreDbService, useValue: firestoreDbServiceMock },
      ],
    });
  });

  it('should load an existing user profile', async () => {
    const profil: IBenutzerProfilDokument = {
      anzeigename: 'Test',
      email: 'test@example.com',
      aktiv: true,
      userRole: 'office',
      erlaubteBereiche: ['dashboard'],
      zugriffe: { 'u-1': { 'f-1': ['b-1'] } },
    };
    firestoreDbServiceMock.loadDocument.mockResolvedValue({
      id: 'benutzer-123',
      daten: profil,
    });
    const service = TestBed.inject(BenutzerService);

    const result = await service.getBenutzerProfil('benutzer-123');

    expect(firestoreDbServiceMock.loadDocument).toHaveBeenCalledWith('benutzerprofil/benutzer-123');
    expect(result).toEqual(profil);
  });

  it('should normalize legacy array access without granting data access', async () => {
    firestoreDbServiceMock.loadDocument.mockResolvedValue({
      id: 'alt',
      daten: {
        email: 'alt@example.com',
        anzeigename: 'Altprofil',
        aktiv: true,
        userRole: 'master',
        erlaubteBereiche: ['dashboard'],
        zugriffe: [],
      },
    });
    const service = TestBed.inject(BenutzerService);

    await expect(service.getBenutzerProfil('alt')).resolves.toMatchObject({ zugriffe: {} });
  });

  it('should discard malformed and empty access entries', async () => {
    firestoreDbServiceMock.loadDocument.mockResolvedValue({
      id: 'test',
      daten: {
        email: 'test@example.com',
        anzeigename: 'Test',
        aktiv: true,
        userRole: 'office',
        erlaubteBereiche: ['dashboard'],
        zugriffe: { u: { leer: [], falsch: 'b', gueltig: ['b'] } },
      },
    });
    const service = TestBed.inject(BenutzerService);

    await expect(service.getBenutzerProfil('test')).resolves.toMatchObject({
      zugriffe: { u: { gueltig: ['b'] } },
    });
  });

  it('should return null when the user profile does not exist', async () => {
    const service = TestBed.inject(BenutzerService);

    const result = await service.getBenutzerProfil('benutzer-123');

    expect(result).toBeNull();
  });

  it('should load, normalize and sort all user profiles', async () => {
    firestoreDbServiceMock.loadCollection.mockResolvedValue([
      {
        id: 'z',
        daten: {
          email: 'z@example.com',
          anzeigename: 'Zulu',
          aktiv: true,
          userRole: 'office',
          erlaubteBereiche: ['dashboard'],
          zugriffe: { u: { f: ['b'] } },
        },
      },
      {
        id: 'a',
        daten: {
          email: 'a@example.com',
          anzeigename: 'Alpha',
          aktiv: true,
          userRole: 'filiale',
          erlaubteBereiche: ['dashboard'],
          zugriffe: [],
        },
      },
    ]);
    const service = TestBed.inject(BenutzerService);

    await expect(service.loadBenutzerProfile()).resolves.toEqual([
      expect.objectContaining({ uid: 'a', anzeigename: 'Alpha', zugriffe: {} }),
      expect.objectContaining({ uid: 'z', anzeigename: 'Zulu', zugriffe: { u: { f: ['b'] } } }),
    ]);
    expect(firestoreDbServiceMock.loadCollection).toHaveBeenCalledWith('benutzerprofil');
  });

  it('should update editable profile data with a server timestamp', async () => {
    const service = TestBed.inject(BenutzerService);
    const aktualisierung: IBenutzerProfilAktualisierung = {
      anzeigename: 'Office Neu',
      aktiv: true,
      erlaubteBereiche: ['dashboard', 'verwaltung'],
      zugriffe: { u: { f: ['b'] } },
    };

    await service.updateBenutzerProfil('office-1', aktualisierung);

    expect(firestoreDbServiceMock.updateDocument).toHaveBeenCalledWith('benutzerprofil/office-1', {
      ...aktualisierung,
      aktualisiertAm: 'server-timestamp',
    });
  });
});
