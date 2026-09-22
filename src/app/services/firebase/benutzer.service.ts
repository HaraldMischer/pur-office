// pur-office/src/app/services/firebase/benutzer.service.ts

import { Injectable, inject } from '@angular/core';

import { FIRESTORE_DOCUMENT_PATHS } from '../../commons/constants/firebase.constants';
import { IBenutzerProfilDokument, TBenutzerZugriffe } from '../../commons/models/domain/benutzer';
import { FirestoreDbService } from './firestore-db.service';

@Injectable({
  providedIn: 'root',
})
export class BenutzerService {
  // ===== Interne Dependency Injection =========

  private readonly firestoreDbService = inject(FirestoreDbService);

  // ===== Oeffentliche Aktionen =================

  /**
   * Laedt das Benutzerprofil fuer die uebergebene Firebase-Auth-UID.
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

    const profil = dokument.daten;

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
}
