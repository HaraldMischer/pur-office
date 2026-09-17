// pur-office/src/app/stores/domain/passwort.store.ts

import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { AuthService } from '../../services/firebase/auth.service';

type PasswortState = {
  inProgress: boolean;
  error: string | null;
  erfolgreich: boolean;
};

const initialState: PasswortState = {
  inProgress: false,
  error: null,
  erfolgreich: false,
};

export const PasswortStore = signalStore(
  { protectedState: true },
  withState<PasswortState>(initialState),
  withMethods((store, authService = inject(AuthService)) => ({
    async changePassword(aktuellesPasswort: string, neuesPasswort: string): Promise<void> {
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
    },
  })),
);
