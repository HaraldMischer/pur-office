// pur-office/src/app/services/firebase/filiale.service.spec.ts

import { TestBed } from '@angular/core/testing';

import { IFilialeAnlage } from '../../commons/models/domain/filiale';
import { FilialeService } from './filiale.service';
import { FirestoreDbService } from './firestore-db.service';

describe('FilialeService', () => {
  const firestoreDbServiceMock = {
    loadCollection: vi.fn(),
    loadDocument: vi.fn(),
    createDocument: vi.fn(),
    createServerTimestamp: vi.fn(),
  };
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
    firestoreDbServiceMock.loadCollection.mockResolvedValue([]);
    firestoreDbServiceMock.loadDocument.mockResolvedValue(null);
    firestoreDbServiceMock.createDocument.mockResolvedValue('filiale-123');
    firestoreDbServiceMock.createServerTimestamp.mockReturnValue('server-zeitstempel');

    TestBed.configureTestingModule({
      providers: [
        FilialeService,
        { provide: FirestoreDbService, useValue: firestoreDbServiceMock },
      ],
    });
  });

  it('should load one assigned branch by its complete path', async () => {
    firestoreDbServiceMock.loadDocument.mockResolvedValue({
      id: 'filiale-1',
      daten: { anzeigename: ' Filiale Nord ', nummer: 3 },
    });
    const service = TestBed.inject(FilialeService);

    await expect(
      service.loadFilialeEintrag('unternehmer-1', 'firma-1', 'filiale-1'),
    ).resolves.toEqual({
      id: 'filiale-1',
      anzeigename: 'Filiale Nord',
      nummer: 3,
    });
    expect(firestoreDbServiceMock.loadDocument).toHaveBeenCalledWith(
      'unternehmer/unternehmer-1/firma/firma-1/filiale/filiale-1',
    );
  });

  it('should return null for a missing assigned branch', async () => {
    const service = TestBed.inject(FilialeService);

    await expect(
      service.loadFilialeEintrag('unternehmer-1', 'firma-1', 'unbekannt'),
    ).resolves.toBeNull();
  });

  it('should load, normalize and sort branches of a company', async () => {
    firestoreDbServiceMock.loadCollection.mockResolvedValue([
      { id: 'b', daten: { anzeigename: ' Beta ', nummer: 2 } },
      { id: 'a', daten: { anzeigename: 'Alpha', nummer: 1 } },
      { id: 'z', daten: { anzeigename: 42, nummer: -1 } },
    ]);
    const service = TestBed.inject(FilialeService);

    await expect(service.loadFilialen('unternehmer-1', 'firma-1')).resolves.toEqual([
      { id: 'a', anzeigename: 'Alpha', nummer: 1 },
      { id: 'b', anzeigename: 'Beta', nummer: 2 },
      { id: 'z', anzeigename: 'z', nummer: 0 },
    ]);
    expect(firestoreDbServiceMock.loadCollection).toHaveBeenCalledWith(
      'unternehmer/unternehmer-1/firma/firma-1/filiale',
    );
  });

  it('should create an active branch with server timestamps', async () => {
    const service = TestBed.inject(FilialeService);

    await expect(service.createFiliale('unternehmer-1', 'firma-1', anlage, 8)).resolves.toEqual({
      id: 'filiale-123',
      nummer: 8,
      anzeigename: 'Gevelsberg 1',
    });
    expect(firestoreDbServiceMock.createServerTimestamp).toHaveBeenCalledOnce();
    expect(firestoreDbServiceMock.createDocument).toHaveBeenCalledWith(
      'unternehmer/unternehmer-1/firma/firma-1/filiale',
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
    const service = TestBed.inject(FilialeService);

    await expect(service.createFiliale('unternehmer-1', 'firma-1', anlage, 1)).rejects.toBe(error);
  });
});
