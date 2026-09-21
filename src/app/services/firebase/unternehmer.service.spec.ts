// pur-office/src/app/services/firebase/unternehmer.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { IUnternehmerAnlage } from '../../commons/models/domain/unternehmer';
import {
  FIRESTORE_ADD_DOC,
  FIRESTORE_COLLECTION,
  FIRESTORE_SERVER_TIMESTAMP,
} from '../../commons/tokens/firebase.tokens';
import { UnternehmerService } from './unternehmer.service';

describe('UnternehmerService', () => {
  const firestoreMock = {} as Firestore;
  const collectionMock = vi.fn().mockReturnValue('unternehmer-ref');
  const addDocMock = vi.fn().mockResolvedValue({ id: 'unternehmer-123' });
  const serverTimestampMock = vi.fn().mockReturnValue('server-zeitstempel');
  const anlage: IUnternehmerAnlage = {
    name: 'Unternehmer Nord',
    adresse: {
      strasse: 'Hauptstraße',
      hausnummer: '1',
      postleitzahl: '20095',
      ort: 'Hamburg',
      land: 'Deutschland',
    },
    kontakt: {
      email: 'info@example.com',
      telefon: '040 123456',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    addDocMock.mockResolvedValue({ id: 'unternehmer-123' });

    TestBed.configureTestingModule({
      providers: [
        UnternehmerService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: FIRESTORE_ADD_DOC, useValue: addDocMock },
        { provide: FIRESTORE_COLLECTION, useValue: collectionMock },
        { provide: FIRESTORE_SERVER_TIMESTAMP, useValue: serverTimestampMock },
      ],
    });
  });

  it('should create an active entrepreneur with server timestamps', async () => {
    const service = TestBed.inject(UnternehmerService);

    await expect(service.createUnternehmer(anlage, 8)).resolves.toEqual({
      id: 'unternehmer-123',
      nummer: 8,
      name: 'Unternehmer Nord',
    });
    expect(collectionMock).toHaveBeenCalledWith(firestoreMock, 'unternehmer');
    expect(serverTimestampMock).toHaveBeenCalledOnce();
    expect(addDocMock).toHaveBeenCalledWith('unternehmer-ref', {
      ...anlage,
      nummer: 8,
      aktiv: true,
      erstelltAm: 'server-zeitstempel',
      aktualisiertAm: 'server-zeitstempel',
    });
  });

  it('should propagate Firestore errors', async () => {
    const error = { code: 'permission-denied' };
    addDocMock.mockRejectedValue(error);
    const service = TestBed.inject(UnternehmerService);

    await expect(service.createUnternehmer(anlage, 1)).rejects.toBe(error);
  });
});
