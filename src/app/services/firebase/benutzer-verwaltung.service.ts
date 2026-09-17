// pur-office/src/app/services/firebase/benutzer-verwaltung.service.ts

import { Injectable, inject } from '@angular/core';
import { Functions } from '@angular/fire/functions';

import { IBenutzerAnlage, IBenutzerAnlageErgebnis } from '../../commons/models/domain/benutzer';
import { HTTPS_CALLABLE } from '../../commons/tokens/firebase.tokens';

@Injectable({ providedIn: 'root' })
export class BenutzerVerwaltungService {
  private readonly _functions = inject(Functions);
  private readonly _httpsCallable = inject(HTTPS_CALLABLE);

  async createBenutzer(anlage: IBenutzerAnlage): Promise<IBenutzerAnlageErgebnis> {
    const createBenutzer = this._httpsCallable<IBenutzerAnlage, IBenutzerAnlageErgebnis>(
      this._functions,
      'createBenutzer',
    );
    const result = await createBenutzer(anlage);

    return result.data;
  }
}
