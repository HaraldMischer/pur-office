// pur-office/src/app/services/firebase/benutzer.service.ts

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import { IBenutzerDokument } from '../../commons/models/domain/benutzer';
import { FIRESTORE_DOC, FIRESTORE_GET_DOC } from '../../commons/tokens/firebase.tokens';

@Injectable({
  providedIn: 'root',
})
export class BenutzerService {
  private readonly _injector = inject(Injector);
  private readonly _firestore = inject(Firestore);
  private readonly _firestoreDoc = inject(FIRESTORE_DOC);
  private readonly _firestoreGetDoc = inject(FIRESTORE_GET_DOC);

  async getBenutzerProfil(uid: string): Promise<IBenutzerDokument | null> {
    const dokument = await runInInjectionContext(this._injector, () =>
      this._firestoreGetDoc(this._firestoreDoc(this._firestore, 'benutzer', uid)),
    );

    if (!dokument.exists()) {
      return null;
    }

    return dokument.data() as IBenutzerDokument;
  }
}
