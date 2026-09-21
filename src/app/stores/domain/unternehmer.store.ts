// pur-office/src/app/stores/domain/unternehmer.store.ts

import { DestroyRef, inject, untracked } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  IUnternehmerAnlage,
  IUnternehmerAnlageErgebnis,
  IUnternehmerEintrag,
} from '../../commons/models/domain/unternehmer';
import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { StoreDebugService } from '../../services/core/store-debug.service';
import { DatenzugriffService } from '../../services/firebase/datenzugriff.service';
import { UnternehmerService } from '../../services/firebase/unternehmer.service';

// ===== Top-Level Helper =====================

export type TUnternehmerSnapshot = {
  readonly unternehmer: readonly IUnternehmerEintrag[];
  readonly download: boolean;
  readonly isLoaded: boolean;
  readonly inProgress: boolean;
  readonly error: string | null;
};

type TUnternehmerState = TUnternehmerSnapshot;

const initialState: TUnternehmerState = {
  unternehmer: [],
  download: false,
  isLoaded: false,
  inProgress: false,
  error: null,
};

function sortUnternehmer(unternehmer: IUnternehmerEintrag[]): readonly IUnternehmerEintrag[] {
  return [...unternehmer].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

function getNaechsteNummer(unternehmer: readonly IUnternehmerEintrag[]): number {
  return Math.max(0, ...unternehmer.map((eintrag) => eintrag.nummer)) + 1;
}

export const UnternehmerStore = signalStore(
  { providedIn: 'root', protectedState: true } as const,
  withState<TUnternehmerState>(initialState),
  withMethods(
    (
      store,
      datenService = inject(DatenzugriffService),
      unternehmerService = inject(UnternehmerService),
      destroyRef = inject(DestroyRef),
      storeDebugService = inject(StoreDebugService),
    ) => {
      // ===== Methoden: Laden ======================

      /**
       * Laedt alle Unternehmer und aktualisiert die sortierte Unternehmerliste im Store.
       *
       * @returns Ein Promise, das nach dem vollstaendigen Laden abgeschlossen ist.
       * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
       */
      async function loadUnternehmer(): Promise<void> {
        if (store.download() || store.isLoaded()) return;

        patchState(store, { download: true, isLoaded: false, error: null });
        try {
          const unternehmer = await datenService.loadUnternehmer();
          patchState(store, { unternehmer: sortUnternehmer(unternehmer), isLoaded: true });
        } catch (error: unknown) {
          patchState(store, { error: getFirebaseErrorMessage(error) });
          throw error;
        } finally {
          patchState(store, { download: false });
        }
      }

      // ===== Methoden: Schreiben ==================

      /**
       * Legt einen Unternehmer mit der naechsten freien Nummer an und aktualisiert die Liste.
       *
       * @param anlage - Die Daten des neu anzulegenden Unternehmers.
       * @returns Das Anlageergebnis mit Dokument-ID, Nummer und Name.
       * @throws Wenn die Unternehmerliste nicht vollstaendig geladen ist oder das Speichern fehlschlaegt.
       */
      async function createUnternehmer(
        anlage: IUnternehmerAnlage,
      ): Promise<IUnternehmerAnlageErgebnis> {
        if (!store.isLoaded()) {
          throw new Error('Die Unternehmer müssen vor der Anlage vollständig geladen werden.');
        }

        patchState(store, { inProgress: true, error: null });
        try {
          const nummer = getNaechsteNummer(store.unternehmer());
          const ergebnis = await unternehmerService.createUnternehmer(anlage, nummer);
          const unternehmer = store.unternehmer().filter((eintrag) => eintrag.id !== ergebnis.id);
          patchState(store, {
            unternehmer: sortUnternehmer([...unternehmer, ergebnis]),
          });
          return ergebnis;
        } catch (error: unknown) {
          patchState(store, { error: getFirebaseErrorMessage(error) });
          throw error;
        } finally {
          patchState(store, { inProgress: false });
        }
      }

      // ===== Methoden: Sonstige Aktionen ==========

      /**
       * Liefert eine Momentaufnahme des aktuellen Unternehmer-Store-Zustands.
       *
       * @returns Vollstaendiger, nicht reaktiv verfolgter Store-Zustand.
       */
      function snapshot(): TUnternehmerSnapshot {
        return untracked(() => ({
          unternehmer: store.unternehmer(),
          download: store.download(),
          isLoaded: store.isLoaded(),
          inProgress: store.inProgress(),
          error: store.error(),
        }));
      }

      /**
       * Entfernt die aktuelle Fehlermeldung des Unternehmer-Stores.
       */
      function clearError(): void {
        patchState(store, { error: null });
      }

      const unregisterSnapshot = storeDebugService.registerStoreSnapshot(
        'UnternehmerStore',
        snapshot,
      );
      destroyRef.onDestroy(unregisterSnapshot);

      return {
        loadUnternehmer,
        createUnternehmer,
        snapshot,
        clearError,
      };
    },
  ),
);
