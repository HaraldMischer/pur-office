// pur-office/src/app/stores/domain/passwort.store.ts

import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { AuthService } from '../../services/firebase/auth.service';

// ===== Top-Level Helper =====================

type TPasswortState = {
  inProgress: boolean;
  error: string | null;
  erfolgreich: boolean;
};

const initialState: TPasswortState = {
  inProgress: false,
  error: null,
  erfolgreich: false,
};

export const PasswortStore = signalStore(
  { protectedState: true },
  withState<TPasswortState>(initialState),
  withMethods((store, authService = inject(AuthService)) => {
    // ===== Methoden: Schreiben ==================

    /**
     * Speichert ein neues Passwort nach erfolgreicher Pruefung des aktuellen Passworts.
     *
     * @param aktuellesPasswort - Das aktuelle Passwort zur erneuten Authentifizierung.
     * @param neuesPasswort - Das neu zu speichernde Passwort.
     * @throws Gibt Fehler der Passwortaenderung an die aufrufende Stelle weiter.
     */
    async function savePasswort(aktuellesPasswort: string, neuesPasswort: string): Promise<void> {
      patchState(store, { inProgress: true, error: null, erfolgreich: false });

      try {
        await authService.changePassword(aktuellesPasswort, neuesPasswort);
        patchState(store, { erfolgreich: true });
      } catch (error: unknown) {
        patchState(store, { error: getFirebaseErrorMessage(error) });
        throw error;
      } finally {
        patchState(store, { inProgress: false });
      }
    }

    return { savePasswort };
  }),
);
