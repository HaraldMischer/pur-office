// pur-office/src/app/stores/domain/filiale.store.ts

import { DestroyRef, inject, untracked } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import {
  IFilialeAnlage,
  IFilialeAnlageErgebnis,
  IFilialeEintrag,
} from '../../commons/models/domain/filiale';
import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { StoreDebugService } from '../../services/core/store-debug.service';
import { FilialeService } from '../../services/firebase/filiale.service';

// ===== Top-Level Helper =====================

export type TFilialeSnapshot = {
  readonly filialen: readonly IFilialeEintrag[];
  readonly unternehmerId: string | null;
  readonly firmaId: string | null;
  readonly download: boolean;
  readonly isLoaded: boolean;
  readonly inProgress: boolean;
  readonly error: string | null;
};

type TFilialeState = TFilialeSnapshot;

const initialState: TFilialeState = {
  filialen: [],
  unternehmerId: null,
  firmaId: null,
  download: false,
  isLoaded: false,
  inProgress: false,
  error: null,
};

function sortFilialen(filialen: IFilialeEintrag[]): readonly IFilialeEintrag[] {
  return [...filialen].sort((a, b) => a.anzeigename.localeCompare(b.anzeigename, 'de'));
}

function getNaechsteNummer(filialen: readonly IFilialeEintrag[]): number {
  return Math.max(0, ...filialen.map((eintrag) => eintrag.nummer)) + 1;
}

export const FilialeStore = signalStore(
  { providedIn: 'root', protectedState: true } as const,
  withState<TFilialeState>(initialState),
  withMethods(
    (
      store,
      filialeService = inject(FilialeService),
      destroyRef = inject(DestroyRef),
      storeDebugService = inject(StoreDebugService),
    ) => {
      // ===== Methoden: Laden ======================

      /**
       * Laedt die Filialen einer Firma und aktualisiert die sortierte Filialliste.
       *
       * @param unternehmerId - Die Dokument-ID des ausgewaehlten Unternehmers.
       * @param firmaId - Die Dokument-ID der ausgewaehlten Firma.
       * @returns Ein Promise, das nach dem vollstaendigen Laden abgeschlossen ist.
       * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
       */
      async function loadFilialen(unternehmerId: string, firmaId: string): Promise<void> {
        const gleicherKontext =
          store.unternehmerId() === unternehmerId && store.firmaId() === firmaId;
        if (gleicherKontext && (store.download() || store.isLoaded())) return;

        patchState(store, {
          filialen: [],
          unternehmerId,
          firmaId,
          download: true,
          isLoaded: false,
          error: null,
        });
        try {
          const filialen = await filialeService.loadFilialen(unternehmerId, firmaId);
          if (store.unternehmerId() === unternehmerId && store.firmaId() === firmaId) {
            patchState(store, { filialen: sortFilialen(filialen), isLoaded: true });
          }
        } catch (error: unknown) {
          if (store.unternehmerId() === unternehmerId && store.firmaId() === firmaId) {
            patchState(store, { error: getFirebaseErrorMessage(error) });
          }
          throw error;
        } finally {
          if (store.unternehmerId() === unternehmerId && store.firmaId() === firmaId) {
            patchState(store, { download: false });
          }
        }
      }

      // ===== Methoden: Schreiben ==================

      /**
       * Legt eine Filiale unter der geladenen Firma an und aktualisiert die Filialliste.
       *
       * @param unternehmerId - Die Dokument-ID des ausgewaehlten Unternehmers.
       * @param firmaId - Die Dokument-ID der ausgewaehlten Firma.
       * @param anlage - Die Daten der neu anzulegenden Filiale.
       * @returns Das Anlageergebnis mit Dokument-ID, Nummer und Anzeigename.
       * @throws Wenn die Filialliste nicht passend geladen ist oder das Speichern fehlschlaegt.
       */
      async function createFiliale(
        unternehmerId: string,
        firmaId: string,
        anlage: IFilialeAnlage,
      ): Promise<IFilialeAnlageErgebnis> {
        if (
          !store.isLoaded() ||
          store.unternehmerId() !== unternehmerId ||
          store.firmaId() !== firmaId
        ) {
          throw new Error('Die Filialen müssen vor der Anlage vollständig geladen werden.');
        }

        patchState(store, { inProgress: true, error: null });
        try {
          const nummer = getNaechsteNummer(store.filialen());
          const ergebnis = await filialeService.createFiliale(
            unternehmerId,
            firmaId,
            anlage,
            nummer,
          );
          const filialen = store.filialen().filter((eintrag) => eintrag.id !== ergebnis.id);
          patchState(store, { filialen: sortFilialen([...filialen, ergebnis]) });
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
       * Setzt die Filialliste und ihren Hierarchiebezug zurueck.
       */
      function resetFilialen(): void {
        patchState(store, initialState);
      }

      /**
       * Entfernt die aktuelle Fehlermeldung des Filiale-Stores.
       */
      function clearError(): void {
        patchState(store, { error: null });
      }

      /**
       * Liefert eine Momentaufnahme des aktuellen Filiale-Store-Zustands.
       *
       * @returns Vollstaendiger, nicht reaktiv verfolgter Store-Zustand.
       */
      function snapshot(): TFilialeSnapshot {
        return untracked(() => ({
          filialen: store.filialen(),
          unternehmerId: store.unternehmerId(),
          firmaId: store.firmaId(),
          download: store.download(),
          isLoaded: store.isLoaded(),
          inProgress: store.inProgress(),
          error: store.error(),
        }));
      }

      const unregisterSnapshot = storeDebugService.registerStoreSnapshot('FilialeStore', snapshot);
      destroyRef.onDestroy(unregisterSnapshot);

      return {
        loadFilialen,
        createFiliale,
        resetFilialen,
        clearError,
        snapshot,
      };
    },
  ),
);
