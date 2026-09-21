// pur-office/src/app/services/firebase/datenzugriff.service.ts

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FIRESTORE_COLLECTION, FIRESTORE_GET_DOCS } from '../../commons/tokens/firebase.tokens';
import { IDatenzugriffEintrag } from '../../commons/models/domain/datenzugriff';
import { IUnternehmerEintrag } from '../../commons/models/domain/unternehmer';

@Injectable({ providedIn: 'root' })
export class DatenzugriffService {
  private readonly injector = inject(Injector);
  private readonly firestore = inject(Firestore);
  private readonly collection = inject(FIRESTORE_COLLECTION);
  private readonly getDocs = inject(FIRESTORE_GET_DOCS);

  async loadUnternehmer(): Promise<IUnternehmerEintrag[]> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      this.getDocs(this.collection(this.firestore, 'unternehmer')),
    );

    return snapshot.docs
      .map((dokument) => {
        const daten = dokument.data();
        const name: unknown = daten['name'];
        const nummer: unknown = daten['nummer'];
        return {
          id: dokument.id,
          name: typeof name === 'string' && name.trim() ? name.trim() : dokument.id,
          nummer: Number.isInteger(nummer) && Number(nummer) > 0 ? Number(nummer) : 0,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
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
