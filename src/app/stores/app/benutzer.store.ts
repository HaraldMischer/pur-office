// pur-office/src/app/stores/app/benutzer.store.ts

import { DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { TAppBereich } from '../../commons/models/app/app-bereich';
import { IBenutzerDokument } from '../../commons/models/domain/benutzer';
import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { AuthService } from '../../services/firebase/auth.service';
import { BenutzerService } from '../../services/firebase/benutzer.service';

type BenutzerState = {
  benutzerProfil: IBenutzerDokument | null;
  isAuthenticated: boolean;
  inProgress: boolean;
  error: string | null;
};

const initialState: BenutzerState = {
  benutzerProfil: null,
  isAuthenticated: false,
  inProgress: false,
  error: null,
};

export const BenutzerStore = signalStore(
  { providedIn: 'root', protectedState: true } as const,
  withState<BenutzerState>(initialState),
  withComputed((store) => ({
    isLoggedIn: computed(() => store.benutzerProfil() !== null),
    istMaster: computed(() => store.benutzerProfil()?.userRole === 'master'),
    istAktiv: computed(() => store.benutzerProfil()?.aktiv === true),
    erlaubteBereiche: computed(() => store.benutzerProfil()?.erlaubteBereiche ?? []),
    zugriffe: computed(() => store.benutzerProfil()?.zugriffe ?? []),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      benutzerService = inject(BenutzerService),
      destroyRef = inject(DestroyRef),
    ) => {
      let authStateInitialisiert = false;

      return {
        initAuthState(): void {
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
        },

        async login(email: string, password: string): Promise<void> {
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
        },

        async logout(): Promise<void> {
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
        },

        darfBereichNutzen(bereich: TAppBereich): boolean {
          const benutzerProfil = store.benutzerProfil();

          return (
            benutzerProfil?.aktiv === true && benutzerProfil.erlaubteBereiche.includes(bereich)
          );
        },

        darfFirmaLesen(unternehmerId: string, firmaId: string): boolean {
          const benutzerProfil = store.benutzerProfil();

          return (
            benutzerProfil?.aktiv === true &&
            (benutzerProfil.userRole === 'master' ||
              (['office', 'filiale'].includes(benutzerProfil.userRole) &&
                (benutzerProfil.zugriffe[unternehmerId]?.[firmaId]?.length ?? 0) > 0))
          );
        },

        darfFilialeLesen(unternehmerId: string, firmaId: string, filialId: string): boolean {
          const benutzerProfil = store.benutzerProfil();

          return (
            benutzerProfil?.aktiv === true &&
            (benutzerProfil.userRole === 'master' ||
              (['office', 'filiale'].includes(benutzerProfil.userRole) &&
                (benutzerProfil.zugriffe[unternehmerId]?.[firmaId] ?? []).includes(filialId)))
          );
        },

        setBenutzerProfil(benutzerProfil: IBenutzerDokument | null): void {
          patchState(store, { benutzerProfil });
        },

        setInProgress(inProgress: boolean): void {
          patchState(store, { inProgress });
        },

        setError(error: string | null): void {
          patchState(store, { error });
        },

        clearError(): void {
          patchState(store, { error: null });
        },

        reset(): void {
          patchState(store, initialState);
        },
      };
    },
  ),
);
