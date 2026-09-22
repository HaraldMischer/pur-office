// pur-office/src/app/services/firebase/benutzer.service.spec.ts

import { TestBed } from '@angular/core/testing';

import { IBenutzerProfilDokument } from '../../commons/models/domain/benutzer';
import { BenutzerService } from './benutzer.service';
import { FirestoreDbService } from './firestore-db.service';

describe('BenutzerService', () => {
  const firestoreDbServiceMock = {
    loadDocument: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreDbServiceMock.loadDocument.mockResolvedValue(null);

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
});
