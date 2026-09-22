// pur-office/src/app/services/firebase/firma.service.ts

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import {
  IFirmaAnlage,
  IFirmaAnlageErgebnis,
  IFirmaEintrag,
} from '../../commons/models/domain/firma';
import {
  FIRESTORE_ADD_DOC,
  FIRESTORE_COLLECTION,
  FIRESTORE_GET_DOCS,
  FIRESTORE_SERVER_TIMESTAMP,
} from '../../commons/tokens/firebase.tokens';

@Injectable({ providedIn: 'root' })
export class FirmaService {
  // ===== Interne Dependency Injection =========

  private readonly injector = inject(Injector);
  private readonly firestore = inject(Firestore);
  private readonly addDoc = inject(FIRESTORE_ADD_DOC);
  private readonly collection = inject(FIRESTORE_COLLECTION);
  private readonly getDocs = inject(FIRESTORE_GET_DOCS);
  private readonly serverTimestamp = inject(FIRESTORE_SERVER_TIMESTAMP);

  // ===== Oeffentliche Aktionen =================

  /**
   * Laedt alle Firmen eines Unternehmers und bildet sie als sortierte Domaeneneintraege ab.
   *
   * @param unternehmerId - Die Dokument-ID des uebergeordneten Unternehmers.
   * @returns Die nach Anzeigename sortierten Firmen.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadFirmen(unternehmerId: string): Promise<IFirmaEintrag[]> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      this.getDocs(this.collection(this.firestore, 'unternehmer', unternehmerId, 'firma')),
    );

    return snapshot.docs
      .map((dokument) => {
        const daten = dokument.data();
        const anzeigename: unknown = daten['anzeigename'];
        const nummer: unknown = daten['nummer'];
        return {
          id: dokument.id,
          anzeigename:
            typeof anzeigename === 'string' && anzeigename.trim()
              ? anzeigename.trim()
              : dokument.id,
          nummer: Number.isInteger(nummer) && Number(nummer) > 0 ? Number(nummer) : 0,
        };
      })
      .sort((a, b) => a.anzeigename.localeCompare(b.anzeigename, 'de'));
  }

  /**
   * Legt eine Firma mit der uebergebenen fortlaufenden Nummer unter einem Unternehmer an.
   *
   * @param unternehmerId - Die Dokument-ID des uebergeordneten Unternehmers.
   * @param anlage - Die Anzeige-, Adress- und Kontaktdaten der neuen Firma.
   * @param nummer - Die fuer die Firma ermittelte fortlaufende Nummer.
   * @returns Das Anlageergebnis mit Dokument-ID, Nummer und Anzeigename.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async createFirma(
    unternehmerId: string,
    anlage: IFirmaAnlage,
    nummer: number,
  ): Promise<IFirmaAnlageErgebnis> {
    const zeitstempel = this.serverTimestamp();
    const firmaRef = await runInInjectionContext(this.injector, () =>
      this.addDoc(this.collection(this.firestore, 'unternehmer', unternehmerId, 'firma'), {
        ...anlage,
        nummer,
        aktiv: true,
        erstelltAm: zeitstempel,
        aktualisiertAm: zeitstempel,
      }),
    );

    return {
      id: firmaRef.id,
      nummer,
      anzeigename: anlage.anzeigename,
    };
  }
}
