// pur-office/src/app/stores/domain/verwaltung.store.ts

import { DestroyRef, computed, inject, untracked } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { IFirmaEintrag } from '../../commons/models/domain/firma';
import { IFilialeEintrag } from '../../commons/models/domain/filiale';
import { IUnternehmerEintrag } from '../../commons/models/domain/unternehmer';
import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { StoreSnapshotService } from '../../services/core/store-snapshot.service';
import { FilialeService } from '../../services/domain/filiale.service';
import { FirmaService } from '../../services/domain/firma.service';
import { UnternehmerService } from '../../services/domain/unternehmer.service';
import { BenutzerStore } from '../app/benutzer.store';
import { StammdatenStore } from '../app/stammdaten.store';

// ===== Top-Level Helper =====================

type TVerwaltungListe<T> = {
  readonly daten: readonly T[];
  readonly download: boolean;
  readonly isLoaded: boolean;
  readonly error: string | null;
};

function createLeereListe<T>(): TVerwaltungListe<T> {
  return { daten: [], download: false, isLoaded: false, error: null };
}

function istVorhanden<T>(eintrag: T | null): eintrag is T {
  return eintrag !== null;
}

function sortEintraege<T extends { anzeigename: string }>(eintraege: readonly T[]): readonly T[] {
  return [...eintraege].sort((a, b) => a.anzeigename.localeCompare(b.anzeigename, 'de'));
}

export type TVerwaltungSnapshot = {
  readonly unternehmerListe: TVerwaltungListe<IUnternehmerEintrag>;
  readonly firmenListe: TVerwaltungListe<IFirmaEintrag>;
  readonly filialenListe: TVerwaltungListe<IFilialeEintrag>;
  readonly selectedUnternehmerId: string | null;
  readonly selectedFirmaId: string | null;
  readonly selectedFilialeId: string | null;
};

type TVerwaltungState = TVerwaltungSnapshot;

const initialState: TVerwaltungState = {
  unternehmerListe: createLeereListe<IUnternehmerEintrag>(),
  firmenListe: createLeereListe<IFirmaEintrag>(),
  filialenListe: createLeereListe<IFilialeEintrag>(),
  selectedUnternehmerId: null,
  selectedFirmaId: null,
  selectedFilialeId: null,
};

export const VerwaltungStore = signalStore(
  { providedIn: 'root', protectedState: true } as const,
  withState<TVerwaltungState>(initialState),
  withComputed((store) => {
    const unternehmer = computed(() => {
      return store.unternehmerListe().daten;
    });
    const firmen = computed(() => {
      return store.firmenListe().daten;
    });
    const filialen = computed(() => {
      return store.filialenListe().daten;
    });

    return {
      unternehmer,
      firmen,
      filialen,
    };
  }),
  withMethods(
    (
      store,
      stammdatenStore = inject(StammdatenStore),
      benutzerStore = inject(BenutzerStore),
      unternehmerService = inject(UnternehmerService),
      firmaService = inject(FirmaService),
      filialeService = inject(FilialeService),
      destroyRef = inject(DestroyRef),
      storeSnapshotService = inject(StoreSnapshotService),
    ) => {
      let unternehmerGeneration = 0;
      let firmenGeneration = 0;
      let filialenGeneration = 0;

      // ===== Methoden: Laden ======================

      /**
       * Lädt die für das aktuelle Benutzerprofil erlaubten Unternehmer.
       *
       * Master laden die vollständige Unternehmerliste. Andere Rollen laden ausschließlich
       * die in ihren Datenzugriffen enthaltenen Unternehmerdokumente.
       *
       * @returns Ein Promise, das nach Abschluss des Ladevorgangs beendet ist.
       */
      async function loadUnternehmer(): Promise<void> {
        if (store.unternehmerListe().download || store.unternehmerListe().isLoaded) return;

        const profil = benutzerStore.benutzerProfil();
        if (!stammdatenStore.isLoaded() && !profil?.aktiv) {
          patchState(store, {
            unternehmerListe: {
              ...createLeereListe<IUnternehmerEintrag>(),
              error: stammdatenStore.error() ?? 'Die Stammdaten konnten nicht geladen werden.',
            },
          });
          return;
        }

        const generation = ++unternehmerGeneration;
        patchState(store, {
          unternehmerListe: {
            ...createLeereListe<IUnternehmerEintrag>(),
            download: true,
          },
        });

        try {
          const unternehmer = stammdatenStore.isLoaded()
            ? stammdatenStore.unternehmer()
            : profil?.userRole === 'master'
              ? await unternehmerService.loadUnternehmer()
              : (
                  await Promise.all(
                    Object.keys(profil?.zugriffe ?? {}).map((unternehmerId) => {
                      return unternehmerService.loadUnternehmerEintrag(unternehmerId);
                    }),
                  )
                ).filter(istVorhanden);

          if (generation !== unternehmerGeneration) return;
          patchState(store, {
            unternehmerListe: {
              daten: sortEintraege(unternehmer),
              download: false,
              isLoaded: true,
              error: null,
            },
          });
        } catch (error: unknown) {
          if (generation !== unternehmerGeneration) return;
          patchState(store, {
            unternehmerListe: {
              ...createLeereListe<IUnternehmerEintrag>(),
              error: getFirebaseErrorMessage(error),
            },
          });
        }
      }

      /**
       * Lädt die für den ausgewählten Unternehmer erlaubten Firmen.
       *
       * @returns Ein Promise, das nach Abschluss des Ladevorgangs beendet ist.
       */
      async function loadFirmen(): Promise<void> {
        const unternehmerId = store.selectedUnternehmerId();
        const profil = benutzerStore.benutzerProfil();
        if (!unternehmerId || (!stammdatenStore.isLoaded() && !profil?.aktiv)) return;
        if (store.firmenListe().download || store.firmenListe().isLoaded) return;

        const generation = ++firmenGeneration;
        patchState(store, {
          firmenListe: { ...createLeereListe<IFirmaEintrag>(), download: true },
        });

        try {
          const firmen = stammdatenStore.isLoaded()
            ? stammdatenStore.getFirmen(unternehmerId)
            : profil?.userRole === 'master'
              ? await firmaService.loadFirmen(unternehmerId)
              : (
                  await Promise.all(
                    Object.keys(profil?.zugriffe[unternehmerId] ?? {}).map((firmaId) => {
                      return firmaService.loadFirmaEintrag(unternehmerId, firmaId);
                    }),
                  )
                ).filter(istVorhanden);

          if (generation !== firmenGeneration || store.selectedUnternehmerId() !== unternehmerId) {
            return;
          }
          patchState(store, {
            firmenListe: {
              daten: sortEintraege(firmen),
              download: false,
              isLoaded: true,
              error: null,
            },
          });
        } catch (error: unknown) {
          if (generation !== firmenGeneration || store.selectedUnternehmerId() !== unternehmerId) {
            return;
          }
          patchState(store, {
            firmenListe: {
              ...createLeereListe<IFirmaEintrag>(),
              error: getFirebaseErrorMessage(error),
            },
          });
        }
      }

      /**
       * Lädt die für die ausgewählte Firma erlaubten Filialen.
       *
       * @returns Ein Promise, das nach Abschluss des Ladevorgangs beendet ist.
       */
      async function loadFilialen(): Promise<void> {
        const unternehmerId = store.selectedUnternehmerId();
        const firmaId = store.selectedFirmaId();
        const profil = benutzerStore.benutzerProfil();
        if (!unternehmerId || !firmaId || (!stammdatenStore.isLoaded() && !profil?.aktiv)) return;
        if (store.filialenListe().download || store.filialenListe().isLoaded) return;

        const generation = ++filialenGeneration;
        patchState(store, {
          filialenListe: { ...createLeereListe<IFilialeEintrag>(), download: true },
        });

        try {
          const filialen = stammdatenStore.isLoaded()
            ? stammdatenStore.getFilialen(unternehmerId, firmaId)
            : profil?.userRole === 'master'
              ? await filialeService.loadFilialen(unternehmerId, firmaId)
              : (
                  await Promise.all(
                    (profil?.zugriffe[unternehmerId]?.[firmaId] ?? []).map((filialeId) => {
                      return filialeService.loadFilialeEintrag(unternehmerId, firmaId, filialeId);
                    }),
                  )
                ).filter(istVorhanden);

          if (
            generation !== filialenGeneration ||
            store.selectedUnternehmerId() !== unternehmerId ||
            store.selectedFirmaId() !== firmaId
          ) {
            return;
          }
          patchState(store, {
            filialenListe: {
              daten: sortEintraege(filialen),
              download: false,
              isLoaded: true,
              error: null,
            },
          });
        } catch (error: unknown) {
          if (
            generation !== filialenGeneration ||
            store.selectedUnternehmerId() !== unternehmerId ||
            store.selectedFirmaId() !== firmaId
          ) {
            return;
          }
          patchState(store, {
            filialenListe: {
              ...createLeereListe<IFilialeEintrag>(),
              error: getFirebaseErrorMessage(error),
            },
          });
        }
      }

      // ===== Methoden: Sonstige Aktionen ==========

      /**
       * Wählt einen geladenen Unternehmer aus und lädt dessen erlaubte Firmen.
       *
       * @param unternehmerId - Die Unternehmer-ID oder `null` zum Zurücksetzen.
       * @returns Ein Promise, das nach dem Laden der Firmen beendet ist.
       */
      async function selectUnternehmer(unternehmerId: string | null): Promise<void> {
        const selectedUnternehmerId = store
          .unternehmer()
          .some((eintrag) => eintrag.id === unternehmerId)
          ? unternehmerId
          : null;
        firmenGeneration++;
        filialenGeneration++;
        patchState(store, {
          selectedUnternehmerId,
          selectedFirmaId: null,
          selectedFilialeId: null,
          firmenListe: createLeereListe<IFirmaEintrag>(),
          filialenListe: createLeereListe<IFilialeEintrag>(),
        });

        if (selectedUnternehmerId) await loadFirmen();
      }

      /**
       * Wählt eine geladene Firma aus und lädt deren erlaubte Filialen.
       *
       * @param firmaId - Die Firma-ID oder `null` zum Zurücksetzen.
       * @returns Ein Promise, das nach dem Laden der Filialen beendet ist.
       */
      async function selectFirma(firmaId: string | null): Promise<void> {
        const selectedFirmaId = store.firmen().some((eintrag) => eintrag.id === firmaId)
          ? firmaId
          : null;
        filialenGeneration++;
        patchState(store, {
          selectedFirmaId,
          selectedFilialeId: null,
          filialenListe: createLeereListe<IFilialeEintrag>(),
        });

        if (selectedFirmaId) await loadFilialen();
      }

      /**
       * Wählt eine geladene Filiale aus.
       *
       * @param filialeId - Die Filiale-ID oder `null` zum Zurücksetzen.
       */
      function selectFiliale(filialeId: string | null): void {
        const selectedFilialeId = store.filialen().some((eintrag) => eintrag.id === filialeId)
          ? filialeId
          : null;
        patchState(store, { selectedFilialeId });
      }

      /**
       * Liefert eine Momentaufnahme des Verwaltungs-Store-Zustands.
       *
       * @returns Vollständiger, nicht reaktiv verfolgter Store-Zustand.
       */
      function snapshot(): TVerwaltungSnapshot {
        return untracked(() => ({
          unternehmerListe: store.unternehmerListe(),
          firmenListe: store.firmenListe(),
          filialenListe: store.filialenListe(),
          selectedUnternehmerId: store.selectedUnternehmerId(),
          selectedFirmaId: store.selectedFirmaId(),
          selectedFilialeId: store.selectedFilialeId(),
        }));
      }

      const unregisterSnapshot = storeSnapshotService.registerStoreSnapshot(
        'VerwaltungStore',
        snapshot,
      );
      destroyRef.onDestroy(unregisterSnapshot);

      return {
        loadUnternehmer,
        loadFirmen,
        loadFilialen,
        selectUnternehmer,
        selectFirma,
        selectFiliale,
        snapshot,
      };
    },
  ),
);
