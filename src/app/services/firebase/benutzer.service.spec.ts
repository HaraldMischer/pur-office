// pur-office/src/app/services/firebase/benutzer.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { IBenutzerDokument } from '../../commons/models/domain/benutzer';
import { FIRESTORE_DOC, FIRESTORE_GET_DOC } from '../../commons/tokens/firebase.tokens';
import { BenutzerService } from './benutzer.service';

describe('BenutzerService', () => {
  let firestoreMock: Firestore;
  let firestoreDocMock: ReturnType<typeof vi.fn>;
  let firestoreGetDocMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    firestoreMock = {} as Firestore;
    firestoreDocMock = vi.fn().mockReturnValue('benutzer-doc-ref');
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
    const profil: IBenutzerDokument = {
      uid: 'benutzer-123',
      anzeigename: 'Test',
      email: 'test@example.com',
      aktiv: true,
      userRole: 'office',
      erlaubteBereiche: ['dashboard'],
      zugriffe: [],
    };
    firestoreGetDocMock.mockResolvedValue({
      exists: () => true,
      data: () => profil,
    });
    const service = TestBed.inject(BenutzerService);

    const result = await service.getBenutzerProfil('benutzer-123');

    expect(firestoreDocMock).toHaveBeenCalledWith(firestoreMock, 'benutzer', 'benutzer-123');
    expect(firestoreGetDocMock).toHaveBeenCalledWith('benutzer-doc-ref');
    expect(result).toBe(profil);
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
