// pur-office/src/app/stores/domain/firma.store.spec.ts

import { TestBed } from '@angular/core/testing';

import { IFirmaAnlage } from '../../commons/models/domain/firma';
import { FirmaService } from '../../services/firebase/firma.service';
import { FirmaStore } from './firma.store';

describe('FirmaStore', () => {
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
  let firmaServiceMock: {
    loadFirmen: ReturnType<typeof vi.fn>;
    createFirma: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    firmaServiceMock = {
      loadFirmen: vi.fn().mockResolvedValue([
        { id: 'z', anzeigename: 'Zulu', nummer: 4 },
        { id: 'a', anzeigename: 'Alpha', nummer: 2 },
      ]),
      createFirma: vi.fn().mockResolvedValue({
        id: 'n',
        nummer: 5,
        anzeigename: anlage.anzeigename,
      }),
    };

    TestBed.configureTestingModule({
      providers: [FirmaStore, { provide: FirmaService, useValue: firmaServiceMock }],
    });
  });

  it('should load and sort companies for an entrepreneur', async () => {
    const store = TestBed.inject(FirmaStore);

    await store.loadFirmen('unternehmer-1');

    expect(firmaServiceMock.loadFirmen).toHaveBeenCalledWith('unternehmer-1');
    expect(store.firmen()).toEqual([
      { id: 'a', anzeigename: 'Alpha', nummer: 2 },
      { id: 'z', anzeigename: 'Zulu', nummer: 4 },
    ]);
    expect(store.unternehmerId()).toBe('unternehmer-1');
    expect(store.download()).toBe(false);
    expect(store.isLoaded()).toBe(true);
  });

  it('should replace the company context when loading another entrepreneur', async () => {
    const store = TestBed.inject(FirmaStore);
    await store.loadFirmen('unternehmer-1');
    firmaServiceMock.loadFirmen.mockResolvedValue([{ id: 'b', anzeigename: 'Beta', nummer: 1 }]);

    await store.loadFirmen('unternehmer-2');

    expect(store.unternehmerId()).toBe('unternehmer-2');
    expect(store.firmen()).toEqual([{ id: 'b', anzeigename: 'Beta', nummer: 1 }]);
  });

  it('should create a company and add it to the sorted list', async () => {
    const store = TestBed.inject(FirmaStore);
    await store.loadFirmen('unternehmer-1');

    await expect(store.createFirma('unternehmer-1', anlage)).resolves.toEqual({
      id: 'n',
      nummer: 5,
      anzeigename: 'Firma Nord',
    });
    expect(firmaServiceMock.createFirma).toHaveBeenCalledWith('unternehmer-1', anlage, 5);
    expect(store.firmen()).toEqual([
      { id: 'a', anzeigename: 'Alpha', nummer: 2 },
      { id: 'n', anzeigename: 'Firma Nord', nummer: 5 },
      { id: 'z', anzeigename: 'Zulu', nummer: 4 },
    ]);
  });

  it('should expose errors and reset the company context', async () => {
    const store = TestBed.inject(FirmaStore);
    firmaServiceMock.loadFirmen.mockRejectedValue({ code: 'unavailable' });

    await expect(store.loadFirmen('unternehmer-1')).rejects.toEqual({ code: 'unavailable' });
    expect(store.error()).toBe('Die Daten sind gerade nicht erreichbar. Bitte versuche es erneut.');

    store.clearError();
    expect(store.error()).toBeNull();
    store.resetFirmen();
    expect(store.snapshot()).toEqual({
      firmen: [],
      unternehmerId: null,
      download: false,
      isLoaded: false,
      inProgress: false,
      error: null,
    });
  });

  it('should require the matching company list before creation', async () => {
    const store = TestBed.inject(FirmaStore);
    await store.loadFirmen('unternehmer-1');

    await expect(store.createFirma('unternehmer-2', anlage)).rejects.toThrow(
      'Die Firmen müssen vor der Anlage vollständig geladen werden.',
    );
    expect(firmaServiceMock.createFirma).not.toHaveBeenCalled();
  });
});
