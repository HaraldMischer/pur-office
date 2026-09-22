// pur-office/src/app/services/domain/firma.service.spec.ts

import { TestBed } from '@angular/core/testing';

import { IFirmaAnlage } from '../../commons/models/domain/firma';
import { FirmaService } from './firma.service';
import { FirestoreDbService } from '../firebase/firestore-db.service';

describe('FirmaService', () => {
  const firestoreDbServiceMock = {
    loadCollection: vi.fn(),
    loadDocument: vi.fn(),
    createDocument: vi.fn(),
    createServerTimestamp: vi.fn(),
  };
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
    firestoreDbServiceMock.loadCollection.mockResolvedValue([]);
    firestoreDbServiceMock.loadDocument.mockResolvedValue(null);
    firestoreDbServiceMock.createDocument.mockResolvedValue('firma-123');
    firestoreDbServiceMock.createServerTimestamp.mockReturnValue('server-zeitstempel');

    TestBed.configureTestingModule({
      providers: [FirmaService, { provide: FirestoreDbService, useValue: firestoreDbServiceMock }],
    });
  });

  it('should load one assigned company by its complete path', async () => {
    firestoreDbServiceMock.loadDocument.mockResolvedValue({
      id: 'firma-1',
      daten: { anzeigename: ' Firma Nord ', nummer: 3 },
    });
    const service = TestBed.inject(FirmaService);

    await expect(service.loadFirmaEintrag('unternehmer-1', 'firma-1')).resolves.toEqual({
      id: 'firma-1',
      anzeigename: 'Firma Nord',
      nummer: 3,
    });
    expect(firestoreDbServiceMock.loadDocument).toHaveBeenCalledWith(
      'unternehmer/unternehmer-1/firma/firma-1',
    );
  });

  it('should return null for a missing assigned company', async () => {
    const service = TestBed.inject(FirmaService);

    await expect(service.loadFirmaEintrag('unternehmer-1', 'unbekannt')).resolves.toBeNull();
  });

  it('should load, normalize and sort companies of an entrepreneur', async () => {
    firestoreDbServiceMock.loadCollection.mockResolvedValue([
      { id: 'b', daten: { anzeigename: ' Beta ', nummer: 2 } },
      { id: 'a', daten: { anzeigename: 'Alpha', nummer: 1 } },
      { id: 'z', daten: { anzeigename: 42, nummer: -1 } },
    ]);
    const service = TestBed.inject(FirmaService);

    await expect(service.loadFirmen('unternehmer-1')).resolves.toEqual([
      { id: 'a', anzeigename: 'Alpha', nummer: 1 },
      { id: 'b', anzeigename: 'Beta', nummer: 2 },
      { id: 'z', anzeigename: 'z', nummer: 0 },
    ]);
    expect(firestoreDbServiceMock.loadCollection).toHaveBeenCalledWith(
      'unternehmer/unternehmer-1/firma',
    );
  });

  it('should create an active company with server timestamps', async () => {
    const service = TestBed.inject(FirmaService);

    await expect(service.createFirma('unternehmer-1', anlage, 8)).resolves.toEqual({
      id: 'firma-123',
      nummer: 8,
      anzeigename: 'Firma Nord',
    });
    expect(firestoreDbServiceMock.createServerTimestamp).toHaveBeenCalledOnce();
    expect(firestoreDbServiceMock.createDocument).toHaveBeenCalledWith(
      'unternehmer/unternehmer-1/firma',
      {
        ...anlage,
        nummer: 8,
        aktiv: true,
        erstelltAm: 'server-zeitstempel',
        aktualisiertAm: 'server-zeitstempel',
      },
    );
  });

  it('should propagate Firestore errors', async () => {
    const error = { code: 'permission-denied' };
    firestoreDbServiceMock.createDocument.mockRejectedValue(error);
    const service = TestBed.inject(FirmaService);

    await expect(service.createFirma('unternehmer-1', anlage, 1)).rejects.toBe(error);
  });
});
