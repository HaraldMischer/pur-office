// pur-office/src/app/services/firebase/unternehmer.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { IUnternehmerAnlage } from '../../commons/models/domain/unternehmer';
import {
  FIRESTORE_ADD_DOC,
  FIRESTORE_COLLECTION,
  FIRESTORE_GET_DOCS,
  FIRESTORE_SERVER_TIMESTAMP,
} from '../../commons/tokens/firebase.tokens';
import { UnternehmerService } from './unternehmer.service';

describe('UnternehmerService', () => {
  const firestoreMock = {} as Firestore;
  const collectionMock = vi.fn().mockReturnValue('unternehmer-ref');
  const addDocMock = vi.fn().mockResolvedValue({ id: 'unternehmer-123' });
  const getDocsMock = vi.fn();
  const serverTimestampMock = vi.fn().mockReturnValue('server-zeitstempel');
  const anlage: IUnternehmerAnlage = {
    anzeigename: 'Unternehmer Nord',
    person: {
      vorname: 'Max',
      nachname: 'Mustermann',
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
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    addDocMock.mockResolvedValue({ id: 'unternehmer-123' });
    getDocsMock.mockResolvedValue({ docs: [] });

    TestBed.configureTestingModule({
      providers: [
        UnternehmerService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: FIRESTORE_ADD_DOC, useValue: addDocMock },
        { provide: FIRESTORE_COLLECTION, useValue: collectionMock },
        { provide: FIRESTORE_GET_DOCS, useValue: getDocsMock },
        { provide: FIRESTORE_SERVER_TIMESTAMP, useValue: serverTimestampMock },
      ],
    });
  });

  it('should load, normalize and sort entrepreneurs', async () => {
    getDocsMock.mockResolvedValue({
      docs: [
        { id: 'b', data: () => ({ anzeigename: ' Beta ', nummer: 2 }) },
        { id: 'a', data: () => ({ anzeigename: 'Alpha', nummer: 1 }) },
        { id: 'z', data: () => ({ anzeigename: 42, nummer: -1 }) },
      ],
    });
    const service = TestBed.inject(UnternehmerService);

    await expect(service.loadUnternehmer()).resolves.toEqual([
      { id: 'a', anzeigename: 'Alpha', nummer: 1 },
      { id: 'b', anzeigename: 'Beta', nummer: 2 },
      { id: 'z', anzeigename: 'z', nummer: 0 },
    ]);
    expect(collectionMock).toHaveBeenCalledWith(firestoreMock, 'unternehmer');
    expect(getDocsMock).toHaveBeenCalledWith('unternehmer-ref');
  });

  it('should create an active entrepreneur with server timestamps', async () => {
    const service = TestBed.inject(UnternehmerService);

    await expect(service.createUnternehmer(anlage, 8)).resolves.toEqual({
      id: 'unternehmer-123',
      nummer: 8,
      anzeigename: 'Unternehmer Nord',
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
