// pur-office/src/app/stores/domain/verwaltung.store.spec.ts

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { IBenutzerProfilDokument } from '../../commons/models/domain/benutzer';
import { FilialeService } from '../../services/firebase/filiale.service';
import { FirmaService } from '../../services/firebase/firma.service';
import { UnternehmerService } from '../../services/firebase/unternehmer.service';
import { BenutzerStore } from '../app/benutzer.store';
import { VerwaltungStore } from './verwaltung.store';

describe('VerwaltungStore', () => {
  let profil: ReturnType<typeof signal<IBenutzerProfilDokument | null>>;
  let unternehmerServiceMock: {
    loadUnternehmer: ReturnType<typeof vi.fn>;
    loadUnternehmerEintrag: ReturnType<typeof vi.fn>;
  };
  let firmaServiceMock: {
    loadFirmen: ReturnType<typeof vi.fn>;
    loadFirmaEintrag: ReturnType<typeof vi.fn>;
  };
  let filialeServiceMock: {
    loadFilialen: ReturnType<typeof vi.fn>;
    loadFilialeEintrag: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    profil = signal<IBenutzerProfilDokument | null>({
      email: 'office@example.com',
      anzeigename: 'Office',
      aktiv: true,
      userRole: 'office',
      erlaubteBereiche: ['verwaltung'],
      zugriffe: {
        'unternehmer-1': {
          'firma-1': ['filiale-1'],
        },
      },
    });
    unternehmerServiceMock = {
      loadUnternehmer: vi.fn().mockResolvedValue([]),
      loadUnternehmerEintrag: vi.fn().mockImplementation(async (id: string) => {
        return { id, anzeigename: 'Unternehmer', nummer: 1 };
      }),
    };
    firmaServiceMock = {
      loadFirmen: vi.fn().mockResolvedValue([]),
      loadFirmaEintrag: vi.fn().mockImplementation(async (_unternehmerId: string, id: string) => {
        return { id, anzeigename: 'Firma', nummer: 1 };
      }),
    };
    filialeServiceMock = {
      loadFilialen: vi.fn().mockResolvedValue([]),
      loadFilialeEintrag: vi
        .fn()
        .mockImplementation(async (_unternehmerId: string, _firmaId: string, id: string) => {
          return { id, anzeigename: 'Filiale', nummer: 1 };
        }),
    };

    TestBed.configureTestingModule({
      providers: [
        VerwaltungStore,
        { provide: BenutzerStore, useValue: { benutzerProfil: profil } },
        { provide: UnternehmerService, useValue: unternehmerServiceMock },
        { provide: FirmaService, useValue: firmaServiceMock },
        { provide: FilialeService, useValue: filialeServiceMock },
      ],
    });
  });

  it('should load only assigned documents for an office user', async () => {
    const store = TestBed.inject(VerwaltungStore);

    await store.loadUnternehmer();
    await store.selectUnternehmer('unternehmer-1');
    await store.selectFirma('firma-1');
    store.selectFiliale('filiale-1');

    expect(unternehmerServiceMock.loadUnternehmer).not.toHaveBeenCalled();
    expect(unternehmerServiceMock.loadUnternehmerEintrag).toHaveBeenCalledWith('unternehmer-1');
    expect(firmaServiceMock.loadFirmen).not.toHaveBeenCalled();
    expect(firmaServiceMock.loadFirmaEintrag).toHaveBeenCalledWith('unternehmer-1', 'firma-1');
    expect(filialeServiceMock.loadFilialen).not.toHaveBeenCalled();
    expect(filialeServiceMock.loadFilialeEintrag).toHaveBeenCalledWith(
      'unternehmer-1',
      'firma-1',
      'filiale-1',
    );
    expect(store.selectedFilialeId()).toBe('filiale-1');
  });

  it('should use collection loads for a master', async () => {
    profil.set({
      email: 'master@example.com',
      anzeigename: 'Master',
      aktiv: true,
      userRole: 'master',
      erlaubteBereiche: ['verwaltung'],
      zugriffe: {},
    });
    unternehmerServiceMock.loadUnternehmer.mockResolvedValue([
      { id: 'unternehmer-1', anzeigename: 'Unternehmer', nummer: 1 },
    ]);
    firmaServiceMock.loadFirmen.mockResolvedValue([
      { id: 'firma-1', anzeigename: 'Firma', nummer: 1 },
    ]);
    filialeServiceMock.loadFilialen.mockResolvedValue([
      { id: 'filiale-1', anzeigename: 'Filiale', nummer: 1 },
    ]);
    const store = TestBed.inject(VerwaltungStore);

    await store.loadUnternehmer();
    await store.selectUnternehmer('unternehmer-1');
    await store.selectFirma('firma-1');

    expect(unternehmerServiceMock.loadUnternehmer).toHaveBeenCalledOnce();
    expect(firmaServiceMock.loadFirmen).toHaveBeenCalledWith('unternehmer-1');
    expect(filialeServiceMock.loadFilialen).toHaveBeenCalledWith('unternehmer-1', 'firma-1');
    expect(unternehmerServiceMock.loadUnternehmerEintrag).not.toHaveBeenCalled();
    expect(firmaServiceMock.loadFirmaEintrag).not.toHaveBeenCalled();
    expect(filialeServiceMock.loadFilialeEintrag).not.toHaveBeenCalled();
  });

  it('should reset dependent selections when a parent changes', async () => {
    profil.update((wert) => ({
      ...wert!,
      zugriffe: {
        'unternehmer-1': { 'firma-1': ['filiale-1'] },
        'unternehmer-2': { 'firma-2': ['filiale-2'] },
      },
    }));
    const store = TestBed.inject(VerwaltungStore);
    await store.loadUnternehmer();
    await store.selectUnternehmer('unternehmer-1');
    await store.selectFirma('firma-1');
    store.selectFiliale('filiale-1');

    await store.selectUnternehmer('unternehmer-2');

    expect(store.selectedUnternehmerId()).toBe('unternehmer-2');
    expect(store.selectedFirmaId()).toBeNull();
    expect(store.selectedFilialeId()).toBeNull();
    expect(store.filialen()).toEqual([]);
  });

  it('should expose separate loading errors and a complete snapshot', async () => {
    unternehmerServiceMock.loadUnternehmerEintrag.mockRejectedValue({ code: 'unavailable' });
    const store = TestBed.inject(VerwaltungStore);

    await store.loadUnternehmer();

    expect(store.unternehmerListe().error).toBe(
      'Die Daten sind gerade nicht erreichbar. Bitte versuche es erneut.',
    );
    expect(store.unternehmerListe().download).toBe(false);
    expect(store.snapshot()).toEqual({
      unternehmerListe: store.unternehmerListe(),
      firmenListe: store.firmenListe(),
      filialenListe: store.filialenListe(),
      selectedUnternehmerId: null,
      selectedFirmaId: null,
      selectedFilialeId: null,
    });
  });
});
