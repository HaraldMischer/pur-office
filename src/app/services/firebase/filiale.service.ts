// pur-office/src/app/services/firebase/filiale.service.ts

import { Injectable, inject } from '@angular/core';

import {
  FIRESTORE_COLLECTION_PATHS,
  FIRESTORE_DOCUMENT_PATHS,
} from '../../commons/constants/firebase.constants';
import {
  IFilialeAnlage,
  IFilialeAnlageErgebnis,
  IFilialeEintrag,
} from '../../commons/models/domain/filiale';
import { FirestoreDbService } from './firestore-db.service';

// ===== Top-Level Helper =====================

function mapFilialeEintrag(id: string, daten: Record<string, unknown>): IFilialeEintrag {
  const anzeigename = daten['anzeigename'];
  const nummer = daten['nummer'];

  return {
    id,
    anzeigename: typeof anzeigename === 'string' && anzeigename.trim() ? anzeigename.trim() : id,
    nummer: Number.isInteger(nummer) && Number(nummer) > 0 ? Number(nummer) : 0,
  };
}

@Injectable({ providedIn: 'root' })
export class FilialeService {
  // ===== Interne Dependency Injection =========

  private readonly firestoreDbService = inject(FirestoreDbService);

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
    const dokumente = await this.firestoreDbService.loadCollection<Record<string, unknown>>(
      FIRESTORE_COLLECTION_PATHS.filialen(unternehmerId, firmaId),
    );

    return dokumente
      .map((dokument) => mapFilialeEintrag(dokument.id, dokument.daten))
      .sort((a, b) => a.anzeigename.localeCompare(b.anzeigename, 'de'));
  }

  /**
   * Laedt eine Filiale gezielt ueber ihren vollstaendigen Dokumentpfad.
   *
   * @param unternehmerId - Die Dokument-ID des uebergeordneten Unternehmers.
   * @param firmaId - Die Dokument-ID der uebergeordneten Firma.
   * @param filialeId - Die Dokument-ID der Filiale.
   * @returns Der kompakte Filialeintrag oder `null`, wenn das Dokument nicht existiert.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadFilialeEintrag(
    unternehmerId: string,
    firmaId: string,
    filialeId: string,
  ): Promise<IFilialeEintrag | null> {
    const dokument = await this.firestoreDbService.loadDocument<Record<string, unknown>>(
      FIRESTORE_DOCUMENT_PATHS.filiale(unternehmerId, firmaId, filialeId),
    );

    return dokument ? mapFilialeEintrag(dokument.id, dokument.daten) : null;
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
    const zeitstempel = this.firestoreDbService.createServerTimestamp();
    const id = await this.firestoreDbService.createDocument(
      FIRESTORE_COLLECTION_PATHS.filialen(unternehmerId, firmaId),
      {
        ...anlage,
        nummer,
        aktiv: true,
        erstelltAm: zeitstempel,
        aktualisiertAm: zeitstempel,
      },
    );

    return {
      id,
      nummer,
      anzeigename: anlage.anzeigename,
    };
  }
}
