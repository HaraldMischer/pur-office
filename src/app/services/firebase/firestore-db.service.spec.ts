// pur-office/src/app/services/firebase/firestore-db.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import {
  FIRESTORE_ADD_DOC,
  FIRESTORE_COLLECTION,
  FIRESTORE_DOC,
  FIRESTORE_GET_DOC,
  FIRESTORE_GET_DOCS,
  FIRESTORE_SERVER_TIMESTAMP,
  FIRESTORE_SET_DOC,
} from '../../commons/tokens/firebase.tokens';
import { LoadingService } from '../core/loading.service';
import { FirestoreDbService } from './firestore-db.service';

describe('FirestoreDbService', () => {
  const firestoreMock = {} as Firestore;
  const collectionMock = vi.fn().mockReturnValue('collection-ref');
  const docMock = vi.fn().mockReturnValue('document-ref');
  const getDocsMock = vi.fn();
  const getDocMock = vi.fn();
  const addDocMock = vi.fn();
  const setDocMock = vi.fn();
  const serverTimestampMock = vi.fn().mockReturnValue('server-zeitstempel');
  const trackLoadMock = vi.fn(async <T>(aktion: () => Promise<T>): Promise<T> => {
    return aktion();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getDocsMock.mockResolvedValue({ docs: [] });
    getDocMock.mockResolvedValue({ exists: () => false });
    addDocMock.mockResolvedValue({ id: 'neu-123' });
    setDocMock.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        FirestoreDbService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: FIRESTORE_ADD_DOC, useValue: addDocMock },
        { provide: FIRESTORE_COLLECTION, useValue: collectionMock },
        { provide: FIRESTORE_DOC, useValue: docMock },
        { provide: FIRESTORE_GET_DOC, useValue: getDocMock },
        { provide: FIRESTORE_GET_DOCS, useValue: getDocsMock },
        { provide: FIRESTORE_SERVER_TIMESTAMP, useValue: serverTimestampMock },
        { provide: FIRESTORE_SET_DOC, useValue: setDocMock },
        { provide: LoadingService, useValue: { trackLoad: trackLoadMock } },
      ],
    });
  });

  it('should load a collection with document ids', async () => {
    getDocsMock.mockResolvedValue({
      docs: [{ id: 'dokument-1', data: () => ({ anzeigename: 'Eintrag' }) }],
    });
    const service = TestBed.inject(FirestoreDbService);

    await expect(service.loadCollection('unternehmer')).resolves.toEqual([
      { id: 'dokument-1', daten: { anzeigename: 'Eintrag' } },
    ]);
    expect(trackLoadMock).toHaveBeenCalledOnce();
    expect(collectionMock).toHaveBeenCalledWith(firestoreMock, 'unternehmer');
    expect(getDocsMock).toHaveBeenCalledWith('collection-ref');
  });

  it('should load an existing document', async () => {
    getDocMock.mockResolvedValue({
      id: 'dokument-1',
      exists: () => true,
      data: () => ({ anzeigename: 'Eintrag' }),
    });
    const service = TestBed.inject(FirestoreDbService);

    await expect(service.loadDocument('unternehmer/dokument-1')).resolves.toEqual({
      id: 'dokument-1',
      daten: { anzeigename: 'Eintrag' },
    });
    expect(docMock).toHaveBeenCalledWith(firestoreMock, 'unternehmer/dokument-1');
    expect(getDocMock).toHaveBeenCalledWith('document-ref');
  });

  it('should return null for a missing document', async () => {
    const service = TestBed.inject(FirestoreDbService);

    await expect(service.loadDocument('unternehmer/unbekannt')).resolves.toBeNull();
  });

  it('should create a document and return its id', async () => {
    const service = TestBed.inject(FirestoreDbService);

    await expect(service.createDocument('unternehmer', { aktiv: true })).resolves.toBe('neu-123');
    expect(addDocMock).toHaveBeenCalledWith('collection-ref', { aktiv: true });
  });

  it('should update a document with merge', async () => {
    const service = TestBed.inject(FirestoreDbService);

    await service.updateDocument('unternehmer/dokument-1', { aktiv: false });

    expect(setDocMock).toHaveBeenCalledWith('document-ref', { aktiv: false }, { merge: true });
  });

  it('should create a server timestamp', () => {
    const service = TestBed.inject(FirestoreDbService);

    expect(service.createServerTimestamp()).toBe('server-zeitstempel');
  });
});
