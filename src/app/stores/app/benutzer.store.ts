// pur-office/src/app/stores/app/benutzer.store.ts

import { DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TAppBereich } from '../../commons/models/app/app-bereich';
import { IBenutzerProfilDokument } from '../../commons/models/domain/benutzer';
import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { AuthService } from '../../services/firebase/auth.service';
import { BenutzerService } from '../../services/firebase/benutzer.service';

// ===== Top-Level Helper =====================

type TBenutzerState = {
  benutzerProfil: IBenutzerProfilDokument | null;
  isAuthenticated: boolean;
  inProgress: boolean;
  error: string | null;
};

const initialState: TBenutzerState = {
  benutzerProfil: null,
  isAuthenticated: false,
  inProgress: false,
  error: null,
};

export const BenutzerStore = signalStore(
  { providedIn: 'root', protectedState: true } as const,
  withState<TBenutzerState>(initialState),
  withComputed((store) => {
    const isLoggedIn = computed(() => {
      return store.benutzerProfil() !== null;
    });
    const istMaster = computed(() => {
      return store.benutzerProfil()?.userRole === 'master';
    });
    const istAktiv = computed(() => {
      return store.benutzerProfil()?.aktiv === true;
    });
    const erlaubteBereiche = computed(() => {
      return store.benutzerProfil()?.erlaubteBereiche ?? [];
    });
    const zugriffe = computed(() => {
      return store.benutzerProfil()?.zugriffe ?? {};
    });

    return {
      isLoggedIn,
      istMaster,
      istAktiv,
      erlaubteBereiche,
      zugriffe,
    };
  }),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      benutzerService = inject(BenutzerService),
      destroyRef = inject(DestroyRef),
    ) => {
      let authStateInitialisiert = false;

      // ===== Methoden: Laden ======================

      /**
       * Initialisiert einmalig die Beobachtung des Firebase-Anmeldestatus.
       */
      function initAuthState(): void {
        if (authStateInitialisiert) {
          return;
        }

        authStateInitialisiert = true;
        authService
          .getAuthState()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe(async (benutzer) => {
            if (!benutzer) {
              patchState(store, {
                benutzerProfil: null,
                isAuthenticated: false,
                inProgress: false,
                error: null,
              });
              return;
            }

            patchState(store, { isAuthenticated: true, inProgress: true, error: null });

            try {
              const benutzerProfil = await benutzerService.getBenutzerProfil(benutzer.uid);
              patchState(store, { benutzerProfil });
            } catch (error: unknown) {
              patchState(store, { error: getFirebaseErrorMessage(error) });
            } finally {
              patchState(store, { inProgress: false });
            }
          });
      }

      // ===== Methoden: Sonstige Aktionen ==========

      /**
       * Meldet einen Benutzer an und laedt anschliessend sein Benutzerprofil.
       *
       * @param email - Die normalisierte E-Mail-Adresse des Benutzers.
       * @param password - Das Passwort des Benutzers.
       * @throws Gibt Fehler der Anmeldung oder des Profilladens weiter.
       */
      async function login(email: string, password: string): Promise<void> {
        patchState(store, { inProgress: true, error: null });

        try {
          const credential = await authService.login(email, password);
          console.log('Login-Benutzer', {
            uid: credential.user.uid,
            email: credential.user.email,
          });
          patchState(store, { isAuthenticated: true });
          const benutzerProfil = await benutzerService.getBenutzerProfil(credential.user.uid);
          patchState(store, { benutzerProfil });
        } catch (error: unknown) {
          patchState(store, { error: getFirebaseErrorMessage(error) });
          throw error;
        } finally {
          patchState(store, { inProgress: false });
        }
      }

      /**
       * Meldet den aktuellen Benutzer ab und entfernt das geladene Profil.
       *
       * @throws Gibt Fehler der Abmeldung an die aufrufende Stelle weiter.
       */
      async function logout(): Promise<void> {
        patchState(store, { inProgress: true, error: null });

        try {
          await authService.logout();
          patchState(store, { benutzerProfil: null, isAuthenticated: false });
        } catch (error: unknown) {
          patchState(store, { error: getFirebaseErrorMessage(error) });
          throw error;
        } finally {
          patchState(store, { inProgress: false });
        }
      }

      /**
       * Prueft, ob der aktive Benutzer einen App-Bereich verwenden darf.
       *
       * @param bereich - Der zu pruefende App-Bereich.
       * @returns `true`, wenn das Profil aktiv ist und den Bereich enthaelt.
       */
      function darfBereichNutzen(bereich: TAppBereich): boolean {
        const benutzerProfil = store.benutzerProfil();

        return benutzerProfil?.aktiv === true && benutzerProfil.erlaubteBereiche.includes(bereich);
      }

      /**
       * Prueft den Lesezugriff des aktiven Benutzers auf eine Firma.
       *
       * @param unternehmerId - Die ID des uebergeordneten Unternehmers.
       * @param firmaId - Die ID der zu pruefenden Firma.
       * @returns `true`, wenn das Profil aktiv ist und die Firma lesen darf.
       */
      function darfFirmaLesen(unternehmerId: string, firmaId: string): boolean {
        const benutzerProfil = store.benutzerProfil();

        return (
          benutzerProfil?.aktiv === true &&
          (benutzerProfil.userRole === 'master' ||
            (['office', 'filiale'].includes(benutzerProfil.userRole) &&
              (benutzerProfil.zugriffe[unternehmerId]?.[firmaId]?.length ?? 0) > 0))
        );
      }

      /**
       * Prueft den Lesezugriff des aktiven Benutzers auf eine Filiale.
       *
       * @param unternehmerId - Die ID des uebergeordneten Unternehmers.
       * @param firmaId - Die ID der uebergeordneten Firma.
       * @param filialId - Die ID der zu pruefenden Filiale.
       * @returns `true`, wenn das Profil aktiv ist und die Filiale lesen darf.
       */
      function darfFilialeLesen(
        unternehmerId: string,
        firmaId: string,
        filialId: string,
      ): boolean {
        const benutzerProfil = store.benutzerProfil();

        return (
          benutzerProfil?.aktiv === true &&
          (benutzerProfil.userRole === 'master' ||
            (['office', 'filiale'].includes(benutzerProfil.userRole) &&
              (benutzerProfil.zugriffe[unternehmerId]?.[firmaId] ?? []).includes(filialId)))
        );
      }

      /**
       * Setzt das aktuell verwendete Benutzerprofil.
       *
       * @param benutzerProfil - Das zu speichernde Profil oder `null`.
       */
      function setBenutzerProfil(benutzerProfil: IBenutzerProfilDokument | null): void {
        patchState(store, { benutzerProfil });
      }

      /**
       * Setzt den Zustand einer laufenden Authentifizierungsaktion.
       *
       * @param inProgress - Gibt an, ob gerade eine Aktion ausgefuehrt wird.
       */
      function setInProgress(inProgress: boolean): void {
        patchState(store, { inProgress });
      }

      /**
       * Setzt die aktuelle Fehlermeldung des Benutzer-Stores.
       *
       * @param error - Die Fehlermeldung oder `null`.
       */
      function setError(error: string | null): void {
        patchState(store, { error });
      }

      /**
       * Entfernt die aktuelle Fehlermeldung des Benutzer-Stores.
       */
      function clearError(): void {
        patchState(store, { error: null });
      }

      /**
       * Setzt den Benutzer-Store auf seinen Anfangszustand zurueck.
       */
      function reset(): void {
        patchState(store, initialState);
      }

      return {
        initAuthState,
        login,
        logout,
        darfBereichNutzen,
        darfFirmaLesen,
        darfFilialeLesen,
        setBenutzerProfil,
        setInProgress,
        setError,
        clearError,
        reset,
      };
    },
  ),
);
