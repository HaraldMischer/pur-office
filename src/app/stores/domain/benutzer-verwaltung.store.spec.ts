// pur-office/src/app/stores/domain/benutzer-verwaltung.store.spec.ts

import { TestBed } from '@angular/core/testing';

import { IBenutzerAnlage } from '../../commons/models/domain/benutzer';
import { DatenzugriffService } from '../../services/firebase/datenzugriff.service';
import { BenutzerVerwaltungService } from '../../services/firebase/benutzer-verwaltung.service';
import { BenutzerVerwaltungStore } from './benutzer-verwaltung.store';

describe('BenutzerVerwaltungStore', () => {
  const anlage: IBenutzerAnlage = {
    email: 'user@example.com',
    anzeigename: 'Test Benutzer',
    userRole: 'office',
    erlaubteBereiche: ['dashboard'],
    zugriffe: {},
    passwort: 'SicheresPasswort123!',
  };
  let serviceMock: { createBenutzer: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    serviceMock = {
      createBenutzer: vi.fn().mockResolvedValue({
        uid: 'neu-123',
        email: anlage.email,
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DatenzugriffService,
          useValue: {
            loadUnternehmer: vi.fn().mockResolvedValue([]),
            loadFirmen: vi.fn().mockResolvedValue([]),
            loadFilialen: vi.fn().mockResolvedValue([]),
          },
        },
        { provide: BenutzerVerwaltungService, useValue: serviceMock },
      ],
    });
  });

  it('should provide a complete initial snapshot', () => {
    const store = TestBed.inject(BenutzerVerwaltungStore);

    expect(store.snapshot()).toEqual({
      listen: {},
      unternehmerIds: [],
      firmaIds: [],
      filialen: {},
      inProgress: false,
      error: null,
      createdBenutzer: null,
    });
  });

  it('should create a user and expose the result', async () => {
    const store = TestBed.inject(BenutzerVerwaltungStore);

    await expect(store.createBenutzer(anlage)).resolves.toEqual({
      uid: 'neu-123',
      email: anlage.email,
    });
    expect(serviceMock.createBenutzer).toHaveBeenCalledWith(anlage);
    expect(store.createdBenutzer()).toEqual({
      uid: 'neu-123',
      email: anlage.email,
    });
    expect(store.inProgress()).toBe(false);
  });

  it('should expose a friendly callable error', async () => {
    const error = { code: 'functions/already-exists' };
    serviceMock.createBenutzer.mockRejectedValue(error);
    const store = TestBed.inject(BenutzerVerwaltungStore);

    await expect(store.createBenutzer(anlage)).rejects.toBe(error);
    expect(store.error()).toBe('Zu dieser E-Mail-Adresse besteht bereits ein Benutzerkonto.');
    expect(store.createdBenutzer()).toBeNull();
    expect(store.inProgress()).toBe(false);
  });
  function prepareDaten() {
    const daten = TestBed.inject(DatenzugriffService);
    vi.mocked(daten.loadUnternehmer).mockResolvedValue([
      { id: 'a', anzeigename: 'A' },
      { id: 'b', anzeigename: 'B' },
    ]);
    vi.mocked(daten.loadFirmen).mockResolvedValue([{ id: 'f', anzeigename: 'Firma' }]);
    vi.mocked(daten.loadFilialen).mockResolvedValue([{ id: 'z', anzeigename: 'Filiale' }]);
    return { daten, store: TestBed.inject(BenutzerVerwaltungStore) };
  }

  it('should load dependent lists, cache by full path and prune deselected descendants', async () => {
    const { daten, store } = prepareDaten();
    const a = JSON.stringify(['a', 'f']);
    const b = JSON.stringify(['b', 'f']);
    await store.loadAuswahl();
    expect(daten.loadFirmen).not.toHaveBeenCalled();
    store.selectUnternehmer(['a', 'b']);
    await store.loadAuswahl();
    expect(daten.loadFirmen).toHaveBeenCalledTimes(2);
    expect(daten.loadFilialen).not.toHaveBeenCalled();
    store.selectFirmen([a, b]);
    await store.loadAuswahl();
    expect(daten.loadFilialen).toHaveBeenCalledWith('a', 'f');
    expect(daten.loadFilialen).toHaveBeenCalledWith('b', 'f');
    store.selectFilialen({ [a]: ['z'], [b]: ['z', 'invalid'] });
    store.selectUnternehmer(['b']);
    expect(store.firmaIds()).toEqual([b]);
    expect(store.filialen()).toEqual({ [b]: ['z'] });
    store.selectUnternehmer(['a', 'b']);
    await store.loadAuswahl();
    store.selectFirmen([a, b]);
    await store.loadAuswahl();
    expect(daten.loadUnternehmer).toHaveBeenCalledTimes(1);
    expect(daten.loadFirmen).toHaveBeenCalledTimes(2);
    expect(daten.loadFilialen).toHaveBeenCalledTimes(2);
    expect(store.filialen()).toEqual({ [b]: ['z'] });
  });

  it('should distinguish failed and empty lists and retry without changing creation feedback', async () => {
    const { daten, store } = prepareDaten();
    vi.mocked(daten.loadUnternehmer).mockRejectedValueOnce({ code: 'permission-denied' });
    await store.loadAuswahl();
    expect(store.datenStatus()[0].error).toBeTruthy();
    expect(store.datenStatus()[0].isLoaded).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.inProgress()).toBe(false);
    vi.mocked(daten.loadUnternehmer).mockResolvedValue([]);
    await store.loadAuswahl();
    expect(store.datenStatus()[0]).toMatchObject({
      isLoaded: true,
      download: false,
      error: null,
      daten: [],
    });
    await store.loadAuswahl();
    expect(daten.loadUnternehmer).toHaveBeenCalledTimes(2);
  });

  it('should cache late responses without restoring deselected parents', async () => {
    const { daten, store } = prepareDaten();
    let resolve!: (data: { id: string; anzeigename: string }[]) => void;
    vi.mocked(daten.loadFirmen).mockImplementation((id) =>
      id === 'a'
        ? new Promise((done) => {
            resolve = done;
          })
        : Promise.resolve([]),
    );
    await store.loadAuswahl();
    store.selectUnternehmer(['a']);
    const pending = store.loadAuswahl();
    await Promise.resolve();
    store.selectUnternehmer(['b']);
    await store.loadAuswahl();
    await vi.waitFor(() => expect(resolve).toBeTypeOf('function'));
    resolve([{ id: 'f', anzeigename: 'Spaete Firma' }]);
    await pending;
    expect(store.unternehmerIds()).toEqual(['b']);
    expect(store.firmaIds()).toEqual([]);
    expect(store.datenStatus().map((s) => s.name)).toEqual(['Unternehmer', 'Firmen von B']);
    store.selectUnternehmer(['a']);
    await store.loadAuswahl();
    expect(daten.loadFirmen).toHaveBeenCalledTimes(2);
  });

  it('should ignore pending data after reset', async () => {
    const { daten, store } = prepareDaten();
    let resolve!: (data: { id: string; anzeigename: string }[]) => void;
    vi.mocked(daten.loadUnternehmer).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const pending = store.loadAuswahl();
    await Promise.resolve();
    expect(store.datenStatus()[0].download).toBe(true);
    store.reset();
    resolve([{ id: 'old', anzeigename: 'Alt' }]);
    await pending;
    expect(store.unternehmer()).toEqual([]);
    expect(store.listen()).toEqual({});
  });
  it('should build scoped access payloads and require branches for every selected company', async () => {
    const { store } = prepareDaten();
    const a = JSON.stringify(['a', 'f']);
    const b = JSON.stringify(['b', 'f']);
    await store.loadAuswahl();
    expect(store.datenAuswahlGueltig()).toBe(true);
    expect(store.zugriffe()).toEqual({});
    store.selectUnternehmer(['a', 'b']);
    await store.loadAuswahl();
    expect(store.datenAuswahlGueltig()).toBe(false);
    store.selectFirmen([a, b]);
    await store.loadAuswahl();
    store.selectFilialen({ [a]: ['z'] });
    expect(store.datenAuswahlGueltig()).toBe(false);
    store.selectFilialen({ [a]: ['z'], [b]: ['z'] });
    expect(store.datenAuswahlGueltig()).toBe(true);
    expect(store.zugriffe()).toEqual({ a: { f: ['z'] }, b: { f: ['z'] } });
    store.selectUnternehmer(['b']);
    await store.loadAuswahl();
    expect(store.zugriffe()).toEqual({ b: { f: ['z'] } });
  });
});
