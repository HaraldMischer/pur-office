// pur-office/src/app/services/firebase/unternehmer.service.ts

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import {
  IUnternehmerAnlage,
  IUnternehmerAnlageErgebnis,
} from '../../commons/models/domain/unternehmer';
import {
  FIRESTORE_ADD_DOC,
  FIRESTORE_COLLECTION,
  FIRESTORE_SERVER_TIMESTAMP,
} from '../../commons/tokens/firebase.tokens';

@Injectable({ providedIn: 'root' })
export class UnternehmerService {
  private readonly injector = inject(Injector);
  private readonly firestore = inject(Firestore);
  private readonly addDoc = inject(FIRESTORE_ADD_DOC);
  private readonly collection = inject(FIRESTORE_COLLECTION);
  private readonly serverTimestamp = inject(FIRESTORE_SERVER_TIMESTAMP);

  async createUnternehmer(
    anlage: IUnternehmerAnlage,
    nummer: number,
  ): Promise<IUnternehmerAnlageErgebnis> {
    const zeitstempel = this.serverTimestamp();
    const unternehmerRef = await runInInjectionContext(this.injector, () =>
      this.addDoc(this.collection(this.firestore, 'unternehmer'), {
        ...anlage,
        nummer,
        aktiv: true,
        erstelltAm: zeitstempel,
        aktualisiertAm: zeitstempel,
      }),
    );

    return {
      id: unternehmerRef.id,
      nummer,
      name: anlage.name,
    };
  }
}
