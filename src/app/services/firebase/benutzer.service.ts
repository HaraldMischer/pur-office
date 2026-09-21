// pur-office/src/app/services/firebase/benutzer.service.ts

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import { IBenutzerProfilDokument, TBenutzerZugriffe } from '../../commons/models/domain/benutzer';
import { FIRESTORE_DOC, FIRESTORE_GET_DOC } from '../../commons/tokens/firebase.tokens';

@Injectable({
  providedIn: 'root',
})
export class BenutzerService {
  private readonly _injector = inject(Injector);
  private readonly _firestore = inject(Firestore);
  private readonly _firestoreDoc = inject(FIRESTORE_DOC);
  private readonly _firestoreGetDoc = inject(FIRESTORE_GET_DOC);

  async getBenutzerProfil(uid: string): Promise<IBenutzerProfilDokument | null> {
    const dokument = await runInInjectionContext(this._injector, () =>
      this._firestoreGetDoc(this._firestoreDoc(this._firestore, 'benutzerprofil', uid)),
    );

    if (!dokument.exists()) {
      return null;
    }

    const profil = dokument.data() as Omit<IBenutzerProfilDokument, 'zugriffe'> & { zugriffe?: unknown };

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
