// pur-office/src/app/services/firebase/benutzer.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { IBenutzerProfilDokument } from '../../commons/models/domain/benutzer';
import { FIRESTORE_DOC, FIRESTORE_GET_DOC } from '../../commons/tokens/firebase.tokens';
import { BenutzerService } from './benutzer.service';

describe('BenutzerService', () => {
  let firestoreMock: Firestore;
  let firestoreDocMock: ReturnType<typeof vi.fn>;
  let firestoreGetDocMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    firestoreMock = {} as Firestore;
    firestoreDocMock = vi.fn().mockReturnValue('benutzerprofil-doc-ref');
    firestoreGetDocMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        BenutzerService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: FIRESTORE_DOC, useValue: firestoreDocMock },
        { provide: FIRESTORE_GET_DOC, useValue: firestoreGetDocMock },
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
    firestoreGetDocMock.mockResolvedValue({
      exists: () => true,
      data: () => profil,
    });
    const service = TestBed.inject(BenutzerService);

    const result = await service.getBenutzerProfil('benutzer-123');

    expect(firestoreDocMock).toHaveBeenCalledWith(
      firestoreMock,
      'benutzerprofil',
      'benutzer-123',
    );
    expect(firestoreGetDocMock).toHaveBeenCalledWith('benutzerprofil-doc-ref');
    expect(result).toEqual(profil);
  });

  it('should normalize legacy array access without granting data access', async () => {
    firestoreGetDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({
        email: 'alt@example.com',
        anzeigename: 'Altprofil',
        aktiv: true,
        userRole: 'master',
        erlaubteBereiche: ['dashboard'],
        zugriffe: [],
      }),
    });
    const service = TestBed.inject(BenutzerService);

    await expect(service.getBenutzerProfil('alt')).resolves.toMatchObject({ zugriffe: {} });
  });

  it('should discard malformed and empty access entries', async () => {
    firestoreGetDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({
        email: 'test@example.com',
        anzeigename: 'Test',
        aktiv: true,
        userRole: 'office',
        erlaubteBereiche: ['dashboard'],
        zugriffe: { u: { leer: [], falsch: 'b', gueltig: ['b'] } },
      }),
    });
    const service = TestBed.inject(BenutzerService);

    await expect(service.getBenutzerProfil('test')).resolves.toMatchObject({
      zugriffe: { u: { gueltig: ['b'] } },
    });
  });

  it('should return null when the user profile does not exist', async () => {
    firestoreGetDocMock.mockResolvedValue({
      exists: () => false,
    });
    const service = TestBed.inject(BenutzerService);

    const result = await service.getBenutzerProfil('benutzer-123');

    expect(result).toBeNull();
  });
});
