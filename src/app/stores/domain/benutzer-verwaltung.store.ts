// pur-office/src/app/stores/domain/benutzer-verwaltung.store.ts

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import {
  IBenutzerAnlage,
  IBenutzerAnlageErgebnis,
  TBenutzerZugriffe,
} from '../../commons/models/domain/benutzer';
import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { BenutzerVerwaltungService } from '../../services/firebase/benutzer-verwaltung.service';

import { DatenzugriffService } from '../../services/firebase/datenzugriff.service';
import {
  IDatenzugriffEintrag,
  IUnternehmerAuswahl,
} from '../../commons/models/domain/datenzugriff';

type TDatenzugriffListe = {
  daten: readonly IDatenzugriffEintrag[];
  geladen: boolean;
  laden: boolean;
  fehler: string | null;
};
const leer: TDatenzugriffListe = { daten: [], geladen: false, laden: false, fehler: null };
const unternehmerKey = JSON.stringify(['unternehmer']);
const firmenKey = (id: string) => JSON.stringify(['unternehmer', id, 'firma']);
const filialenKey = (uid: string, fid: string) =>
  JSON.stringify(['unternehmer', uid, 'firma', fid, 'filiale']);
const firmaKey = (uid: string, fid: string) => JSON.stringify([uid, fid]);

type BenutzerVerwaltungState = {
  listen: Record<string, TDatenzugriffListe>;
  unternehmerIds: readonly string[];
  firmaIds: readonly string[];
  filialen: Readonly<Partial<Record<string, readonly string[]>>>;
  inProgress: boolean;
  error: string | null;
  createdBenutzer: IBenutzerAnlageErgebnis | null;
};

const initialState: BenutzerVerwaltungState = {
  listen: {},
  unternehmerIds: [],
  firmaIds: [],
  filialen: {},
  inProgress: false,
  error: null,
  createdBenutzer: null,
};

export const BenutzerVerwaltungStore = signalStore(
  { providedIn: 'root', protectedState: true } as const,
  withState<BenutzerVerwaltungState>(initialState),
  withComputed((store) => ({
    unternehmer: computed<readonly IUnternehmerAuswahl[]>(() =>
      (store.listen()[unternehmerKey]?.daten ?? []).map((unternehmer) => ({
        ...unternehmer,
        firmen: (store.listen()[firmenKey(unternehmer.id)]?.daten ?? []).map((firma) => ({
          ...firma,
          filialen: store.listen()[filialenKey(unternehmer.id, firma.id)]?.daten ?? [],
        })),
      })),
    ),
  })),
  withComputed((store) => ({
    ausgewaehlteFirmen: computed(() =>
      store
        .unternehmer()
        .filter((u) => store.unternehmerIds().includes(u.id))
        .flatMap((u) =>
          u.firmen.map((f) => ({ ...f, unternehmerId: u.id, schluessel: firmaKey(u.id, f.id) })),
        )
        .filter((f) => store.firmaIds().includes(f.schluessel)),
    ),
  })),
  withComputed((store) => ({
    firmenLaden: computed(() =>
      store.unternehmerIds().some((id) => store.listen()[firmenKey(id)]?.laden),
    ),
    filialenLaden: computed(() =>
      store
        .ausgewaehlteFirmen()
        .some((f) => store.listen()[filialenKey(f.unternehmerId, f.id)]?.laden),
    ),
    datenStatus: computed(() =>
      [
        { key: unternehmerKey, name: 'Unternehmer' },
        ...store
          .unternehmer()
          .filter((u) => store.unternehmerIds().includes(u.id))
          .map((u) => ({ key: firmenKey(u.id), name: `Firmen von ${u.name}` })),
        ...store.ausgewaehlteFirmen().map((f) => ({
          key: filialenKey(f.unternehmerId, f.id),
          name: `Filialen von ${f.name}`,
        })),
      ].map((eintrag) => ({ ...eintrag, ...(store.listen()[eintrag.key] ?? leer) })),
    ),
  })),
  withComputed((store) => ({
    zugriffe: computed<TBenutzerZugriffe>(() => {
      const zugriffe = new Map<string, Map<string, string[]>>();
      for (const firma of store.ausgewaehlteFirmen()) {
        const firmen = zugriffe.get(firma.unternehmerId) ?? new Map<string, string[]>();
        firmen.set(firma.id, [...(store.filialen()[firma.schluessel] ?? [])]);
        zugriffe.set(firma.unternehmerId, firmen);
      }
      return Object.fromEntries(
        [...zugriffe].map(([unternehmerId, firmen]) => [unternehmerId, Object.fromEntries(firmen)]),
      );
    }),
    datenAuswahlGueltig: computed(() => {
      if (store.datenStatus().some((status) => status.laden || status.fehler)) return false;
      return (
        store
          .unternehmerIds()
          .every((id) => store.ausgewaehlteFirmen().some((firma) => firma.unternehmerId === id)) &&
        store.ausgewaehlteFirmen().every((firma) => {
          const ids = store.filialen()[firma.schluessel] ?? [];
          return (
            ids.length > 0 && ids.every((id) => firma.filialen.some((filiale) => filiale.id === id))
          );
        })
      );
    }),
  })),
  withMethods((store, datenService = inject(DatenzugriffService)) => {
    let generation = 0;
    const laufend = new Map<string, Promise<void>>();
    async function loadListe(
      key: string,
      laden: () => Promise<readonly IDatenzugriffEintrag[]>,
    ): Promise<void> {
      if (store.listen()[key]?.geladen) return;
      if (laufend.has(key)) return laufend.get(key);
      const aktuell = generation;
      patchState(store, { listen: { ...store.listen(), [key]: { ...leer, laden: true } } });
      const auftrag = (async () => {
        try {
          const daten = await Promise.resolve().then(laden);
          if (aktuell === generation)
            patchState(store, {
              listen: {
                ...store.listen(),
                [key]: { daten, geladen: true, laden: false, fehler: null },
              },
            });
        } catch (error: unknown) {
          if (aktuell === generation)
            patchState(store, {
              listen: {
                ...store.listen(),
                [key]: { ...leer, fehler: getFirebaseErrorMessage(error) },
              },
            });
        } finally {
          if (aktuell === generation) laufend.delete(key);
        }
      })();
      laufend.set(key, auftrag);
      return auftrag;
    }
    async function loadAuswahl(): Promise<void> {
      const aktuell = generation;
      await loadListe(unternehmerKey, () => datenService.loadUnternehmer());
      if (aktuell !== generation) return;
      await Promise.all(
        store
          .unternehmerIds()
          .map((id) => loadListe(firmenKey(id), () => datenService.loadFirmen(id))),
      );
      if (aktuell !== generation) return;
      await Promise.all(
        store
          .ausgewaehlteFirmen()
          .map((f) =>
            loadListe(filialenKey(f.unternehmerId, f.id), () =>
              datenService.loadFilialen(f.unternehmerId, f.id),
            ),
          ),
      );
    }
    function selectFilialen(auswahl: Readonly<Partial<Record<string, readonly string[]>>>): void {
      const filialen: Record<string, readonly string[]> = {};
      for (const firma of store.ausgewaehlteFirmen()) {
        const ids = [...new Set(auswahl[firma.schluessel] ?? [])].filter((id) =>
          firma.filialen.some((f) => f.id === id),
        );
        if (ids.length) filialen[firma.schluessel] = ids;
      }
      patchState(store, { filialen });
    }
    function selectFirmen(ids: readonly string[]): void {
      const verfuegbar = store
        .unternehmer()
        .filter((u) => store.unternehmerIds().includes(u.id))
        .flatMap((u) => u.firmen.map((f) => firmaKey(u.id, f.id)));
      patchState(store, { firmaIds: [...new Set(ids)].filter((id) => verfuegbar.includes(id)) });
      selectFilialen(store.filialen());
      void loadAuswahl();
    }
    return {
      loadAuswahl,
      selectFilialen,
      selectFirmen,
      selectUnternehmer(ids: readonly string[]): void {
        patchState(store, {
          unternehmerIds: [...new Set(ids)].filter((id) =>
            store.unternehmer().some((u) => u.id === id),
          ),
        });
        selectFirmen(store.firmaIds());
      },
      resetDatenzugriff(): void {
        generation++;
        laufend.clear();
        patchState(store, { listen: {}, unternehmerIds: [], firmaIds: [], filialen: {} });
      },
    };
  }),
  withMethods((store, service = inject(BenutzerVerwaltungService)) => ({
    async createBenutzer(anlage: IBenutzerAnlage): Promise<IBenutzerAnlageErgebnis> {
      patchState(store, { inProgress: true, error: null, createdBenutzer: null });

      try {
        const createdBenutzer = await service.createBenutzer(anlage);
        patchState(store, { createdBenutzer });
        return createdBenutzer;
      } catch (error: unknown) {
        patchState(store, { error: getFirebaseErrorMessage(error) });
        throw error;
      } finally {
        patchState(store, { inProgress: false });
      }
    },

    clearFeedback(): void {
      patchState(store, { error: null, createdBenutzer: null });
    },

    reset(): void {
      store.resetDatenzugriff();
      patchState(store, initialState);
    },
  })),
);

/*

| Benutzer | Eigenes Profil | Zugewiesene Kundendaten | Alle anderen Daten | Schreiben |
|---|---:|---:|---:|---:|
| Aktiver Master | Lesen | Lesen | Lesen | Nein |
| Aktiver Office-Benutzer | Lesen | Lesen | Nein | Nein |
| Aktiver Filial-Benutzer | Lesen | Lesen | Nein | Nein |
| Inaktiver Benutzer | Lesen | Nein | Nein | Nein |
| Benutzer mit unbekannter Rolle | Lesen | Nein | Nein | Nein |
| Altkonto ohne Profil | – | Lesen | Lesen* | Ja* |
| Nicht angemeldet | Nein | Nein | Nein | Nein |

 */
