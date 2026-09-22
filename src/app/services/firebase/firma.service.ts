// pur-office/src/app/services/firebase/firma.service.ts

import { Injectable, inject } from '@angular/core';

import {
  FIRESTORE_COLLECTION_PATHS,
  FIRESTORE_DOCUMENT_PATHS,
} from '../../commons/constants/firebase.constants';
import {
  IFirmaAnlage,
  IFirmaAnlageErgebnis,
  IFirmaEintrag,
} from '../../commons/models/domain/firma';
import { FirestoreDbService } from './firestore-db.service';

// ===== Top-Level Helper =====================

function mapFirmaEintrag(id: string, daten: Record<string, unknown>): IFirmaEintrag {
  const anzeigename = daten['anzeigename'];
  const nummer = daten['nummer'];

  return {
    id,
    anzeigename: typeof anzeigename === 'string' && anzeigename.trim() ? anzeigename.trim() : id,
    nummer: Number.isInteger(nummer) && Number(nummer) > 0 ? Number(nummer) : 0,
  };
}

@Injectable({ providedIn: 'root' })
export class FirmaService {
  // ===== Interne Dependency Injection =========

  private readonly firestoreDbService = inject(FirestoreDbService);

  // ===== Oeffentliche Aktionen =================

  /**
   * Laedt alle Firmen eines Unternehmers und bildet sie als sortierte Domaeneneintraege ab.
   *
   * @param unternehmerId - Die Dokument-ID des uebergeordneten Unternehmers.
   * @returns Die nach Anzeigename sortierten Firmen.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadFirmen(unternehmerId: string): Promise<IFirmaEintrag[]> {
    const dokumente = await this.firestoreDbService.loadCollection<Record<string, unknown>>(
      FIRESTORE_COLLECTION_PATHS.firmen(unternehmerId),
    );

    return dokumente
      .map((dokument) => mapFirmaEintrag(dokument.id, dokument.daten))
      .sort((a, b) => a.anzeigename.localeCompare(b.anzeigename, 'de'));
  }

  /**
   * Laedt eine Firma gezielt ueber ihren vollstaendigen Dokumentpfad.
   *
   * @param unternehmerId - Die Dokument-ID des uebergeordneten Unternehmers.
   * @param firmaId - Die Dokument-ID der Firma.
   * @returns Der kompakte Firmeneintrag oder `null`, wenn das Dokument nicht existiert.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadFirmaEintrag(unternehmerId: string, firmaId: string): Promise<IFirmaEintrag | null> {
    const dokument = await this.firestoreDbService.loadDocument<Record<string, unknown>>(
      FIRESTORE_DOCUMENT_PATHS.firma(unternehmerId, firmaId),
    );

    return dokument ? mapFirmaEintrag(dokument.id, dokument.daten) : null;
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
    const zeitstempel = this.firestoreDbService.createServerTimestamp();
    const id = await this.firestoreDbService.createDocument(
      FIRESTORE_COLLECTION_PATHS.firmen(unternehmerId),
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
