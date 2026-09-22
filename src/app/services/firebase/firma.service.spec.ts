// pur-office/src/app/services/firebase/firma.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { IFirmaAnlage } from '../../commons/models/domain/firma';
import {
  FIRESTORE_ADD_DOC,
  FIRESTORE_COLLECTION,
  FIRESTORE_GET_DOCS,
  FIRESTORE_SERVER_TIMESTAMP,
} from '../../commons/tokens/firebase.tokens';
import { FirmaService } from './firma.service';

describe('FirmaService', () => {
  const firestoreMock = {} as Firestore;
  const collectionMock = vi.fn().mockReturnValue('firma-ref');
  const addDocMock = vi.fn().mockResolvedValue({ id: 'firma-123' });
  const getDocsMock = vi.fn();
  const serverTimestampMock = vi.fn().mockReturnValue('server-zeitstempel');
  const anlage: IFirmaAnlage = {
    anzeigename: 'Firma Nord',
    firmenname: 'Firma Nord GmbH',
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
    addDocMock.mockResolvedValue({ id: 'firma-123' });
    getDocsMock.mockResolvedValue({ docs: [] });

    TestBed.configureTestingModule({
      providers: [
        FirmaService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: FIRESTORE_ADD_DOC, useValue: addDocMock },
        { provide: FIRESTORE_COLLECTION, useValue: collectionMock },
        { provide: FIRESTORE_GET_DOCS, useValue: getDocsMock },
        { provide: FIRESTORE_SERVER_TIMESTAMP, useValue: serverTimestampMock },
      ],
    });
  });

  it('should load, normalize and sort companies of an entrepreneur', async () => {
    getDocsMock.mockResolvedValue({
      docs: [
        { id: 'b', data: () => ({ anzeigename: ' Beta ', nummer: 2 }) },
        { id: 'a', data: () => ({ anzeigename: 'Alpha', nummer: 1 }) },
        { id: 'z', data: () => ({ anzeigename: 42, nummer: -1 }) },
      ],
    });
    const service = TestBed.inject(FirmaService);

    await expect(service.loadFirmen('unternehmer-1')).resolves.toEqual([
      { id: 'a', anzeigename: 'Alpha', nummer: 1 },
      { id: 'b', anzeigename: 'Beta', nummer: 2 },
      { id: 'z', anzeigename: 'z', nummer: 0 },
    ]);
    expect(collectionMock).toHaveBeenCalledWith(
      firestoreMock,
      'unternehmer',
      'unternehmer-1',
      'firma',
    );
    expect(getDocsMock).toHaveBeenCalledWith('firma-ref');
  });

  it('should create an active company with server timestamps', async () => {
    const service = TestBed.inject(FirmaService);

    await expect(service.createFirma('unternehmer-1', anlage, 8)).resolves.toEqual({
      id: 'firma-123',
      nummer: 8,
      anzeigename: 'Firma Nord',
    });
    expect(collectionMock).toHaveBeenCalledWith(
      firestoreMock,
      'unternehmer',
      'unternehmer-1',
      'firma',
    );
    expect(serverTimestampMock).toHaveBeenCalledOnce();
    expect(addDocMock).toHaveBeenCalledWith('firma-ref', {
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
    const service = TestBed.inject(FirmaService);

    await expect(service.createFirma('unternehmer-1', anlage, 1)).rejects.toBe(error);
  });
});
