// pur-office/src/app/services/firebase/datenzugriff.service.ts

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FIRESTORE_COLLECTION, FIRESTORE_GET_DOCS } from '../../commons/tokens/firebase.tokens';
import { IDatenzugriffEintrag } from '../../commons/models/domain/datenzugriff';

@Injectable({ providedIn: 'root' })
export class DatenzugriffService {
  private readonly injector = inject(Injector);
  private readonly firestore = inject(Firestore);
  private readonly collection = inject(FIRESTORE_COLLECTION);
  private readonly getDocs = inject(FIRESTORE_GET_DOCS);

  loadUnternehmer(): Promise<IDatenzugriffEintrag[]> {
    return this.loadListe(['unternehmer'], 'customerName');
  }

  loadFirmen(unternehmerId: string): Promise<IDatenzugriffEintrag[]> {
    return this.loadListe(['unternehmer', unternehmerId, 'firma'], 'companyName');
  }

  loadFilialen(unternehmerId: string, firmaId: string): Promise<IDatenzugriffEintrag[]> {
    return this.loadListe(
      ['unternehmer', unternehmerId, 'firma', firmaId, 'filiale'],
      'branchName',
    );
  }

  private async loadListe(pfad: string[], namensfeld: string): Promise<IDatenzugriffEintrag[]> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      this.getDocs(this.collection(this.firestore, pfad[0], ...pfad.slice(1))),
    );
    return snapshot.docs
      .map((dokument) => {
        const name: unknown = dokument.data()[namensfeld];
        return {
          id: dokument.id,
          name: typeof name === 'string' && name.trim() ? name.trim() : dokument.id,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }
}
