// pur-office/src/app/services/domain/benutzer.service.ts

import { Injectable, inject } from '@angular/core';

import {
  FIRESTORE_COLLECTION_PATHS,
  FIRESTORE_DOCUMENT_PATHS,
} from '../../commons/constants/firebase.constants';
import {
  IBenutzerProfilAktualisierung,
  IBenutzerProfilDokument,
  IBenutzerProfilEintrag,
  TBenutzerZugriffe,
} from '../../commons/models/domain/benutzer';
import { FirestoreDbService } from '../firebase/firestore-db.service';

@Injectable({
  providedIn: 'root',
})
export class BenutzerService {
  // ===== Interne Dependency Injection =========

  private readonly firestoreDbService = inject(FirestoreDbService);

  // ===== Öffentliche Aktionen =================

  /**
   * Lädt das Benutzerprofil für die übergebene Firebase-Auth-UID.
   *
   * @param uid - UID des angemeldeten Firebase-Benutzers.
   * @returns Das normalisierte Benutzerprofil oder `null`, wenn kein Profil existiert.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async getBenutzerProfil(uid: string): Promise<IBenutzerProfilDokument | null> {
    const dokument = await this.firestoreDbService.loadDocument<
      Omit<IBenutzerProfilDokument, 'zugriffe'> & { zugriffe?: unknown }
    >(FIRESTORE_DOCUMENT_PATHS.benutzerprofil(uid));

    if (!dokument) {
      return null;
    }

    return this.mapBenutzerProfil(dokument.daten);
  }

  /**
   * Lädt alle Benutzerprofile für die Systemverwaltung.
   *
   * @returns Die nach Anzeigename sortierten Profile einschließlich ihrer Dokument-ID als UID.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadBenutzerProfile(): Promise<IBenutzerProfilEintrag[]> {
    const dokumente = await this.firestoreDbService.loadCollection<
      Omit<IBenutzerProfilDokument, 'zugriffe'> & { zugriffe?: unknown }
    >(FIRESTORE_COLLECTION_PATHS.benutzerprofile);

    return dokumente
      .map((dokument) => ({
        uid: dokument.id,
        ...this.mapBenutzerProfil(dokument.daten),
      }))
      .sort((a, b) => a.anzeigename.localeCompare(b.anzeigename, 'de'));
  }

  /**
   * Aktualisiert die direkt bearbeitbaren Felder eines Benutzerprofils.
   *
   * @param uid - UID des zu aktualisierenden Benutzerprofils.
   * @param aktualisierung - Die bearbeitbaren Profilfelder.
   * @returns Ein Promise, das nach dem bestätigten Schreibvorgang abgeschlossen ist.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async updateBenutzerProfil(
    uid: string,
    aktualisierung: IBenutzerProfilAktualisierung,
  ): Promise<void> {
    await this.firestoreDbService.updateDocument(FIRESTORE_DOCUMENT_PATHS.benutzerprofil(uid), {
      ...aktualisierung,
      aktualisiertAm: this.firestoreDbService.createServerTimestamp(),
    });
  }

  // ===== Interne Helfer =======================

  private parseZugriffe(value: unknown): TBenutzerZugriffe {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {};
    }

    const zugriffe: Array<[string, Record<string, string[]>]> = [];
    for (const [unternehmerId, firmenValue] of Object.entries(value)) {
      if (typeof firmenValue !== 'object' || firmenValue === null || Array.isArray(firmenValue)) {
        continue;
      }

      const firmen: Array<[string, string[]]> = [];
      for (const [firmaId, filialenValue] of Object.entries(firmenValue)) {
        if (
          Array.isArray(filialenValue) &&
          filialenValue.length > 0 &&
          filialenValue.every((id) => typeof id === 'string')
        ) {
          firmen.push([firmaId, filialenValue]);
        }
      }
      zugriffe.push([unternehmerId, Object.fromEntries(firmen)]);
    }

    return Object.fromEntries(zugriffe);
  }

  private mapBenutzerProfil(
    profil: Omit<IBenutzerProfilDokument, 'zugriffe'> & { zugriffe?: unknown },
  ): IBenutzerProfilDokument {
    return {
      email: profil.email,
      anzeigename: profil.anzeigename,
      aktiv: profil.aktiv,
      userRole: profil.userRole,
      erlaubteBereiche: profil.erlaubteBereiche,
      zugriffe: this.parseZugriffe(profil.zugriffe),
      erstelltAm: profil.erstelltAm,
      aktualisiertAm: profil.aktualisiertAm,
    };
  }
}
