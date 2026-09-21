// pur-office/src/app/stores/domain/benutzer-verwaltung.store.ts

import { DestroyRef, computed, inject, untracked } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  IBenutzerAnlage,
  IBenutzerAnlageErgebnis,
  TBenutzerZugriffe,
} from '../../commons/models/domain/benutzer';
import {
  IDatenzugriffEintrag,
  IUnternehmerAuswahl,
} from '../../commons/models/domain/datenzugriff';
import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { StoreDebugService } from '../../services/core/store-debug.service';
import { BenutzerVerwaltungService } from '../../services/firebase/benutzer-verwaltung.service';
import { DatenzugriffService } from '../../services/firebase/datenzugriff.service';

// ===== Top-Level Helper =====================

type TDatenzugriffListe = {
  daten: readonly IDatenzugriffEintrag[];
  isLoaded: boolean;
  download: boolean;
  error: string | null;
};
const leer: TDatenzugriffListe = { daten: [], isLoaded: false, download: false, error: null };
const unternehmerKey = JSON.stringify(['unternehmer']);
const firmenKey = (id: string) => {
  return JSON.stringify(['unternehmer', id, 'firma']);
};
const filialenKey = (uid: string, fid: string) => {
  return JSON.stringify(['unternehmer', uid, 'firma', fid, 'filiale']);
};
const firmaKey = (uid: string, fid: string) => {
  return JSON.stringify([uid, fid]);
};

export type TBenutzerVerwaltungSnapshot = {
  readonly listen: Record<string, TDatenzugriffListe>;
  readonly unternehmerIds: readonly string[];
  readonly firmaIds: readonly string[];
  readonly filialen: Readonly<Partial<Record<string, readonly string[]>>>;
  readonly inProgress: boolean;
  readonly error: string | null;
  readonly createdBenutzer: IBenutzerAnlageErgebnis | null;
};

type TBenutzerVerwaltungState = TBenutzerVerwaltungSnapshot;

const initialState: TBenutzerVerwaltungState = {
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
  withState<TBenutzerVerwaltungState>(initialState),
  withComputed((store) => {
    const unternehmer = computed<readonly IUnternehmerAuswahl[]>(() => {
      return (store.listen()[unternehmerKey]?.daten ?? []).map((unternehmer) => ({
        ...unternehmer,
        firmen: (store.listen()[firmenKey(unternehmer.id)]?.daten ?? []).map((firma) => ({
          ...firma,
          filialen: store.listen()[filialenKey(unternehmer.id, firma.id)]?.daten ?? [],
        })),
      }));
    });
    const ausgewaehlteFirmen = computed(() => {
      return unternehmer()
        .filter((u) => store.unternehmerIds().includes(u.id))
        .flatMap((u) =>
          u.firmen.map((f) => ({ ...f, unternehmerId: u.id, schluessel: firmaKey(u.id, f.id) })),
        )
        .filter((f) => store.firmaIds().includes(f.schluessel));
    });
    const firmenDownload = computed(() => {
      return store.unternehmerIds().some((id) => store.listen()[firmenKey(id)]?.download);
    });
    const filialenDownload = computed(() => {
      return ausgewaehlteFirmen().some(
        (f) => store.listen()[filialenKey(f.unternehmerId, f.id)]?.download,
      );
    });
    const datenStatus = computed(() => {
      return [
        { key: unternehmerKey, name: 'Unternehmer' },
        ...unternehmer()
          .filter((u) => store.unternehmerIds().includes(u.id))
          .map((u) => ({ key: firmenKey(u.id), name: `Firmen von ${u.name}` })),
        ...ausgewaehlteFirmen().map((f) => ({
          key: filialenKey(f.unternehmerId, f.id),
          name: `Filialen von ${f.name}`,
        })),
      ].map((eintrag) => ({ ...eintrag, ...(store.listen()[eintrag.key] ?? leer) }));
    });
    const zugriffe = computed<TBenutzerZugriffe>(() => {
      const zugriffe = new Map<string, Map<string, string[]>>();
      for (const firma of ausgewaehlteFirmen()) {
        const firmen = zugriffe.get(firma.unternehmerId) ?? new Map<string, string[]>();
        firmen.set(firma.id, [...(store.filialen()[firma.schluessel] ?? [])]);
        zugriffe.set(firma.unternehmerId, firmen);
      }
      return Object.fromEntries(
        [...zugriffe].map(([unternehmerId, firmen]) => [unternehmerId, Object.fromEntries(firmen)]),
      );
    });
    const datenAuswahlGueltig = computed(() => {
      if (datenStatus().some((status) => status.download || status.error)) return false;
      return (
        store
          .unternehmerIds()
          .every((id) => ausgewaehlteFirmen().some((firma) => firma.unternehmerId === id)) &&
        ausgewaehlteFirmen().every((firma) => {
          const ids = store.filialen()[firma.schluessel] ?? [];
          return (
            ids.length > 0 && ids.every((id) => firma.filialen.some((filiale) => filiale.id === id))
          );
        })
      );
    });

    return {
      unternehmer,
      ausgewaehlteFirmen,
      firmenDownload,
      filialenDownload,
      datenStatus,
      zugriffe,
      datenAuswahlGueltig,
    };
  }),
  withMethods(
    (
      store,
      datenService = inject(DatenzugriffService),
      service = inject(BenutzerVerwaltungService),
      destroyRef = inject(DestroyRef),
      storeDebugService = inject(StoreDebugService),
    ) => {
      let generation = 0;
      const laufend = new Map<string, Promise<void>>();

      // ===== Methoden: Laden ======================

      /**
       * Laedt eine Zugriffsliste einmalig und verwirft Ergebnisse einer veralteten Store-Generation.
       *
       * @param key - Der eindeutige Schluessel der zu ladenden Liste.
       * @param load - Die Ladefunktion fuer die angeforderte Liste.
       * @returns Ein Promise, das nach Abschluss des Ladevorgangs beendet ist.
       */
      async function loadListe(
        key: string,
        load: () => Promise<readonly IDatenzugriffEintrag[]>,
      ): Promise<void> {
        if (store.listen()[key]?.isLoaded) return;
        if (laufend.has(key)) return laufend.get(key);
        const aktuell = generation;
        patchState(store, { listen: { ...store.listen(), [key]: { ...leer, download: true } } });
        const auftrag = (async () => {
          try {
            const daten = await Promise.resolve().then(load);
            if (aktuell === generation)
              patchState(store, {
                listen: {
                  ...store.listen(),
                  [key]: { daten, isLoaded: true, download: false, error: null },
                },
              });
          } catch (error: unknown) {
            if (aktuell === generation)
              patchState(store, {
                listen: {
                  ...store.listen(),
                  [key]: { ...leer, error: getFirebaseErrorMessage(error) },
                },
              });
          } finally {
            if (aktuell === generation) laufend.delete(key);
          }
        })();
        laufend.set(key, auftrag);
        return auftrag;
      }

      /**
       * Laedt die Unternehmer sowie alle von der aktuellen Auswahl abhaengigen Firmen und Filialen.
       *
       * @returns Ein Promise, das nach Abschluss aller erforderlichen Ladevorgaenge beendet ist.
       */
      async function loadAuswahl(): Promise<void> {
        const aktuell = generation;
        await loadListe(unternehmerKey, () => {
          return datenService.loadUnternehmer();
        });
        if (aktuell !== generation) return;
        await Promise.all(
          store.unternehmerIds().map((id) =>
            loadListe(firmenKey(id), () => {
              return datenService.loadFirmen(id);
            }),
          ),
        );
        if (aktuell !== generation) return;
        await Promise.all(
          store.ausgewaehlteFirmen().map((f) =>
            loadListe(filialenKey(f.unternehmerId, f.id), () => {
              return datenService.loadFilialen(f.unternehmerId, f.id);
            }),
          ),
        );
      }

      // ===== Methoden: Schreiben ==================

      /**
       * Legt einen Benutzer an und speichert das Ergebnis fuer die Rueckmeldung im Store.
       *
       * @param anlage - Die vollstaendigen Daten des neu anzulegenden Benutzers.
       * @returns Das Anlageergebnis mit UID und E-Mail-Adresse.
       * @throws Gibt Fehler der Benutzeranlage an die aufrufende Stelle weiter.
       */
      async function createBenutzer(anlage: IBenutzerAnlage): Promise<IBenutzerAnlageErgebnis> {
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
      }

      // ===== Methoden: Sonstige Aktionen ==========

      /**
       * Uebernimmt gueltige Filialauswahlen fuer die aktuell ausgewaehlten Firmen.
       *
       * @param auswahl - Die Filial-IDs, gruppiert nach dem Schluessel ihrer Firma.
       */
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

      /**
       * Uebernimmt gueltige Firmenauswahlen und laedt die davon abhaengigen Filialen.
       *
       * @param ids - Die Schluessel der ausgewaehlten Firmen.
       */
      function selectFirmen(ids: readonly string[]): void {
        const verfuegbar = store
          .unternehmer()
          .filter((u) => store.unternehmerIds().includes(u.id))
          .flatMap((u) => u.firmen.map((f) => firmaKey(u.id, f.id)));
        patchState(store, { firmaIds: [...new Set(ids)].filter((id) => verfuegbar.includes(id)) });
        selectFilialen(store.filialen());
        void loadAuswahl();
      }

      /**
       * Uebernimmt gueltige Unternehmerauswahlen und aktualisiert die abhaengigen Firmen.
       *
       * @param ids - Die IDs der ausgewaehlten Unternehmer.
       */
      function selectUnternehmer(ids: readonly string[]): void {
        patchState(store, {
          unternehmerIds: [...new Set(ids)].filter((id) =>
            store.unternehmer().some((u) => u.id === id),
          ),
        });
        selectFirmen(store.firmaIds());
      }

      /**
       * Setzt alle geladenen Listen und ausgewaehlten Datenzugriffe zurueck.
       */
      function resetDatenzugriff(): void {
        generation++;
        laufend.clear();
        patchState(store, { listen: {}, unternehmerIds: [], firmaIds: [], filialen: {} });
      }

      /**
       * Entfernt vorhandene Erfolgs- und Fehlerrueckmeldungen.
       */
      function clearFeedback(): void {
        patchState(store, { error: null, createdBenutzer: null });
      }

      /**
       * Setzt den vollstaendigen Benutzer-Verwaltungs-Store auf seinen Anfangszustand zurueck.
       */
      function reset(): void {
        resetDatenzugriff();
        patchState(store, initialState);
      }

      /**
       * Liefert eine Momentaufnahme des aktuellen Benutzer-Verwaltungs-Store-Zustands.
       *
       * @returns Vollstaendiger, nicht reaktiv verfolgter Store-Zustand.
       */
      function snapshot(): TBenutzerVerwaltungSnapshot {
        return untracked(() => ({
          listen: store.listen(),
          unternehmerIds: store.unternehmerIds(),
          firmaIds: store.firmaIds(),
          filialen: store.filialen(),
          inProgress: store.inProgress(),
          error: store.error(),
          createdBenutzer: store.createdBenutzer(),
        }));
      }

      const unregisterSnapshot = storeDebugService.registerStoreSnapshot(
        'BenutzerVerwaltungStore',
        snapshot,
      );
      destroyRef.onDestroy(unregisterSnapshot);

      return {
        loadAuswahl,
        createBenutzer,
        selectFilialen,
        selectFirmen,
        selectUnternehmer,
        resetDatenzugriff,
        clearFeedback,
        reset,
        snapshot,
      };
    },
  ),
);
