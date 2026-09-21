// pur-office/src/app/stores/domain/unternehmer.store.spec.ts

import { TestBed } from '@angular/core/testing';

import { IUnternehmerAnlage } from '../../commons/models/domain/unternehmer';
import { DatenzugriffService } from '../../services/firebase/datenzugriff.service';
import { UnternehmerService } from '../../services/firebase/unternehmer.service';
import { UnternehmerStore } from './unternehmer.store';

describe('UnternehmerStore', () => {
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
  let datenServiceMock: { loadUnternehmer: ReturnType<typeof vi.fn> };
  let unternehmerServiceMock: { createUnternehmer: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    datenServiceMock = {
      loadUnternehmer: vi.fn().mockResolvedValue([
        { id: 'z', name: 'Zulu', nummer: 4 },
        { id: 'a', name: 'Alpha', nummer: 2 },
      ]),
    };
    unternehmerServiceMock = {
      createUnternehmer: vi.fn().mockResolvedValue({
        id: 'n',
        nummer: 5,
        name: anlage.name,
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        UnternehmerStore,
        { provide: DatenzugriffService, useValue: datenServiceMock },
        { provide: UnternehmerService, useValue: unternehmerServiceMock },
      ],
    });
  });

  it('should load and sort entrepreneurs', async () => {
    const store = TestBed.inject(UnternehmerStore);

    await store.loadUnternehmer();

    expect(store.unternehmer()).toEqual([
      { id: 'a', name: 'Alpha', nummer: 2 },
      { id: 'z', name: 'Zulu', nummer: 4 },
    ]);
    expect(store.download()).toBe(false);
    expect(store.isLoaded()).toBe(true);
    expect(store.error()).toBeNull();
  });

  it('should create an entrepreneur and add it to the sorted list', async () => {
    const store = TestBed.inject(UnternehmerStore);
    await store.loadUnternehmer();

    await expect(store.createUnternehmer(anlage)).resolves.toEqual({
      id: 'n',
      nummer: 5,
      name: 'Unternehmer Nord',
    });
    expect(unternehmerServiceMock.createUnternehmer).toHaveBeenCalledWith(anlage, 5);
    expect(store.unternehmer()).toEqual([
      { id: 'a', name: 'Alpha', nummer: 2 },
      { id: 'n', name: 'Unternehmer Nord', nummer: 5 },
      { id: 'z', name: 'Zulu', nummer: 4 },
    ]);
    expect(store.inProgress()).toBe(false);
  });

  it('should expose friendly load and creation errors', async () => {
    const store = TestBed.inject(UnternehmerStore);
    datenServiceMock.loadUnternehmer.mockRejectedValue({ code: 'unavailable' });

    await expect(store.loadUnternehmer()).rejects.toEqual({ code: 'unavailable' });
    expect(store.error()).toBe('Die Daten sind gerade nicht erreichbar. Bitte versuche es erneut.');
    expect(store.download()).toBe(false);
    expect(store.isLoaded()).toBe(false);

    datenServiceMock.loadUnternehmer.mockResolvedValue([]);
    await store.loadUnternehmer();
    unternehmerServiceMock.createUnternehmer.mockRejectedValue({ code: 'permission-denied' });
    await expect(store.createUnternehmer(anlage)).rejects.toEqual({
      code: 'permission-denied',
    });
    expect(store.error()).toBe('Du hast keine Berechtigung fuer diese Aktion.');
    expect(store.inProgress()).toBe(false);

    store.clearError();
    expect(store.error()).toBeNull();
  });

  it('should require a completely loaded entrepreneur list before creation', async () => {
    const store = TestBed.inject(UnternehmerStore);

    await expect(store.createUnternehmer(anlage)).rejects.toThrow(
      'Die Unternehmer müssen vor der Anlage vollständig geladen werden.',
    );
    expect(unternehmerServiceMock.createUnternehmer).not.toHaveBeenCalled();
  });
});
