// pur-office/src/app/services/firebase/filiale.service.ts

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import {
  IFilialeAnlage,
  IFilialeAnlageErgebnis,
  IFilialeEintrag,
} from '../../commons/models/domain/filiale';
import {
  FIRESTORE_ADD_DOC,
  FIRESTORE_COLLECTION,
  FIRESTORE_GET_DOCS,
  FIRESTORE_SERVER_TIMESTAMP,
} from '../../commons/tokens/firebase.tokens';

@Injectable({ providedIn: 'root' })
export class FilialeService {
  // ===== Interne Dependency Injection =========

  private readonly injector = inject(Injector);
  private readonly firestore = inject(Firestore);
  private readonly addDoc = inject(FIRESTORE_ADD_DOC);
  private readonly collection = inject(FIRESTORE_COLLECTION);
  private readonly getDocs = inject(FIRESTORE_GET_DOCS);
  private readonly serverTimestamp = inject(FIRESTORE_SERVER_TIMESTAMP);

  // ===== Oeffentliche Aktionen =================

  /**
   * Laedt alle Filialen einer Firma und bildet sie als sortierte Domaeneneintraege ab.
   *
   * @param unternehmerId - Die Dokument-ID des uebergeordneten Unternehmers.
   * @param firmaId - Die Dokument-ID der uebergeordneten Firma.
   * @returns Die nach Anzeigename sortierten Filialen.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadFilialen(unternehmerId: string, firmaId: string): Promise<IFilialeEintrag[]> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      this.getDocs(
        this.collection(this.firestore, 'unternehmer', unternehmerId, 'firma', firmaId, 'filiale'),
      ),
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
   * Legt eine Filiale mit der uebergebenen fortlaufenden Nummer unter einer Firma an.
   *
   * @param unternehmerId - Die Dokument-ID des uebergeordneten Unternehmers.
   * @param firmaId - Die Dokument-ID der uebergeordneten Firma.
   * @param anlage - Die Anzeige-, Namens-, Adress- und Kontaktdaten der neuen Filiale.
   * @param nummer - Die fuer die Filiale ermittelte fortlaufende Nummer.
   * @returns Das Anlageergebnis mit Dokument-ID, Nummer und Anzeigename.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async createFiliale(
    unternehmerId: string,
    firmaId: string,
    anlage: IFilialeAnlage,
    nummer: number,
  ): Promise<IFilialeAnlageErgebnis> {
    const zeitstempel = this.serverTimestamp();
    const filialeRef = await runInInjectionContext(this.injector, () =>
      this.addDoc(
        this.collection(this.firestore, 'unternehmer', unternehmerId, 'firma', firmaId, 'filiale'),
        {
          ...anlage,
          nummer,
          aktiv: true,
          erstelltAm: zeitstempel,
          aktualisiertAm: zeitstempel,
        },
      ),
    );

    return {
      id: filialeRef.id,
      nummer,
      anzeigename: anlage.anzeigename,
    };
  }
}
