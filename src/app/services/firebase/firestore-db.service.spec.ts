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
import { NetzwerkStatusService } from '../core/netzwerk-status.service';
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
  const assertOnlineMock = vi.fn();

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
        { provide: NetzwerkStatusService, useValue: { assertOnline: assertOnlineMock } },
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
    expect(trackLoadMock).toHaveBeenCalledWith(expect.any(Function));
    expect(collectionMock).toHaveBeenCalledWith(firestoreMock, 'unternehmer');
    expect(getDocsMock).toHaveBeenCalledWith('collection-ref');
  });

  it('should share parallel collection loads for the same path', async () => {
    let resolveSnapshot!: (value: { docs: [] }) => void;
    getDocsMock.mockReturnValue(
      new Promise<{ docs: [] }>((resolve) => {
        resolveSnapshot = resolve;
      }),
    );
    const service = TestBed.inject(FirestoreDbService);

    const ersterAuftrag = service.loadCollection('unternehmer');
    const zweiterAuftrag = service.loadCollection('unternehmer');

    expect(ersterAuftrag).toBe(zweiterAuftrag);
    expect(trackLoadMock).toHaveBeenCalledOnce();
    expect(getDocsMock).toHaveBeenCalledOnce();

    resolveSnapshot({ docs: [] });
    await Promise.all([ersterAuftrag, zweiterAuftrag]);
    await service.loadCollection('unternehmer');

    expect(trackLoadMock).toHaveBeenCalledTimes(2);
    expect(getDocsMock).toHaveBeenCalledTimes(2);
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
    expect(trackLoadMock).toHaveBeenCalledWith(expect.any(Function));
    expect(docMock).toHaveBeenCalledWith(firestoreMock, 'unternehmer/dokument-1');
    expect(getDocMock).toHaveBeenCalledWith('document-ref');
  });

  it('should return null for a missing document', async () => {
    const service = TestBed.inject(FirestoreDbService);

    await expect(service.loadDocument('unternehmer/unbekannt')).resolves.toBeNull();
  });

  it('should share parallel document loads for the same path', async () => {
    let resolveSnapshot!: (value: { exists: () => false }) => void;
    getDocMock.mockReturnValue(
      new Promise<{ exists: () => false }>((resolve) => {
        resolveSnapshot = resolve;
      }),
    );
    const service = TestBed.inject(FirestoreDbService);

    const ersterAuftrag = service.loadDocument('unternehmer/dokument-1');
    const zweiterAuftrag = service.loadDocument('unternehmer/dokument-1');

    expect(ersterAuftrag).toBe(zweiterAuftrag);
    expect(trackLoadMock).toHaveBeenCalledOnce();
    expect(getDocMock).toHaveBeenCalledOnce();

    resolveSnapshot({ exists: () => false });
    await Promise.all([ersterAuftrag, zweiterAuftrag]);

    expect(trackLoadMock).toHaveBeenCalledOnce();
    expect(getDocMock).toHaveBeenCalledOnce();
  });

  it('should create a document and return its id', async () => {
    const service = TestBed.inject(FirestoreDbService);

    await expect(service.createDocument('unternehmer', { aktiv: true })).resolves.toBe('neu-123');
    expect(assertOnlineMock).toHaveBeenCalledOnce();
    expect(addDocMock).toHaveBeenCalledWith('collection-ref', { aktiv: true });
  });

  it('should update a document with merge', async () => {
    const service = TestBed.inject(FirestoreDbService);

    await service.updateDocument('unternehmer/dokument-1', { aktiv: false });

    expect(assertOnlineMock).toHaveBeenCalledOnce();
    expect(setDocMock).toHaveBeenCalledWith('document-ref', { aktiv: false }, { merge: true });
  });

  it('should reject writes before accessing Firestore while offline', async () => {
    const error = { code: 'app/offline' };
    assertOnlineMock.mockImplementation(() => {
      throw error;
    });
    const service = TestBed.inject(FirestoreDbService);

    await expect(service.createDocument('unternehmer', { aktiv: true })).rejects.toBe(error);
    await expect(service.updateDocument('unternehmer/dokument-1', { aktiv: false })).rejects.toBe(
      error,
    );
    expect(addDocMock).not.toHaveBeenCalled();
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it('should create a server timestamp', () => {
    const service = TestBed.inject(FirestoreDbService);

    expect(service.createServerTimestamp()).toBe('server-zeitstempel');
  });
});
