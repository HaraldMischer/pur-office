// pur-office/src/app/services/firebase/filiale.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { IFilialeAnlage } from '../../commons/models/domain/filiale';
import {
  FIRESTORE_ADD_DOC,
  FIRESTORE_COLLECTION,
  FIRESTORE_GET_DOCS,
  FIRESTORE_SERVER_TIMESTAMP,
} from '../../commons/tokens/firebase.tokens';
import { FilialeService } from './filiale.service';

describe('FilialeService', () => {
  const firestoreMock = {} as Firestore;
  const collectionMock = vi.fn().mockReturnValue('filiale-ref');
  const addDocMock = vi.fn().mockResolvedValue({ id: 'filiale-123' });
  const getDocsMock = vi.fn();
  const serverTimestampMock = vi.fn().mockReturnValue('server-zeitstempel');
  const anlage: IFilialeAnlage = {
    anzeigename: 'Gevelsberg 1',
    filialname: 'Spielhalle',
    adresse: {
      strasse: 'Mittelstraße',
      hausnummer: '102',
      postleitzahl: '58285',
      ort: 'Gevelsberg',
      land: 'Deutschland',
    },
    kontakt: {
      email: 'gevelsberg@example.com',
      telefon: '02332 123456',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    addDocMock.mockResolvedValue({ id: 'filiale-123' });
    getDocsMock.mockResolvedValue({ docs: [] });

    TestBed.configureTestingModule({
      providers: [
        FilialeService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: FIRESTORE_ADD_DOC, useValue: addDocMock },
        { provide: FIRESTORE_COLLECTION, useValue: collectionMock },
        { provide: FIRESTORE_GET_DOCS, useValue: getDocsMock },
        { provide: FIRESTORE_SERVER_TIMESTAMP, useValue: serverTimestampMock },
      ],
    });
  });

  it('should load, normalize and sort branches of a company', async () => {
    getDocsMock.mockResolvedValue({
      docs: [
        { id: 'b', data: () => ({ anzeigename: ' Beta ', nummer: 2 }) },
        { id: 'a', data: () => ({ anzeigename: 'Alpha', nummer: 1 }) },
        { id: 'z', data: () => ({ anzeigename: 42, nummer: -1 }) },
      ],
    });
    const service = TestBed.inject(FilialeService);

    await expect(service.loadFilialen('unternehmer-1', 'firma-1')).resolves.toEqual([
      { id: 'a', anzeigename: 'Alpha', nummer: 1 },
      { id: 'b', anzeigename: 'Beta', nummer: 2 },
      { id: 'z', anzeigename: 'z', nummer: 0 },
    ]);
    expect(collectionMock).toHaveBeenCalledWith(
      firestoreMock,
      'unternehmer',
      'unternehmer-1',
      'firma',
      'firma-1',
      'filiale',
    );
    expect(getDocsMock).toHaveBeenCalledWith('filiale-ref');
  });

  it('should create an active branch with server timestamps', async () => {
    const service = TestBed.inject(FilialeService);

    await expect(service.createFiliale('unternehmer-1', 'firma-1', anlage, 8)).resolves.toEqual({
      id: 'filiale-123',
      nummer: 8,
      anzeigename: 'Gevelsberg 1',
    });
    expect(collectionMock).toHaveBeenCalledWith(
      firestoreMock,
      'unternehmer',
      'unternehmer-1',
      'firma',
      'firma-1',
      'filiale',
    );
    expect(serverTimestampMock).toHaveBeenCalledOnce();
    expect(addDocMock).toHaveBeenCalledWith('filiale-ref', {
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
    const service = TestBed.inject(FilialeService);

    await expect(service.createFiliale('unternehmer-1', 'firma-1', anlage, 1)).rejects.toBe(error);
  });
});
