// pur-office/src/app/stores/domain/benutzer-verwaltung.store.ts

import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { IBenutzerAnlage, IBenutzerAnlageErgebnis } from '../../commons/models/domain/benutzer';
import { getFirebaseErrorMessage } from '../../commons/utils/errors/firebase-error-message';
import { BenutzerVerwaltungService } from '../../services/firebase/benutzer-verwaltung.service';

type BenutzerVerwaltungState = {
  inProgress: boolean;
  error: string | null;
  createdBenutzer: IBenutzerAnlageErgebnis | null;
};

const initialState: BenutzerVerwaltungState = {
  inProgress: false,
  error: null,
  createdBenutzer: null,
};

export const BenutzerVerwaltungStore = signalStore(
  { providedIn: 'root', protectedState: true } as const,
  withState<BenutzerVerwaltungState>(initialState),
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
      patchState(store, initialState);
    },
  })),
);
