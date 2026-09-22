// pur-office/src/app/services/firebase/datenzugriff.service.ts

import { Injectable, inject } from '@angular/core';
import { IDatenzugriffEintrag } from '../../commons/models/domain/datenzugriff';
import { FilialeService } from './filiale.service';
import { FirmaService } from './firma.service';
import { UnternehmerService } from './unternehmer.service';

@Injectable({ providedIn: 'root' })
export class DatenzugriffService {
  private readonly filialeService = inject(FilialeService);
  private readonly firmaService = inject(FirmaService);
  private readonly unternehmerService = inject(UnternehmerService);

  /**
   * Laedt Unternehmer als kompakte Eintraege fuer die Datenzugriffsauswahl.
   *
   * @returns Die IDs und Anzeigenamen der Unternehmer.
   * @throws Gibt Fehler des Unternehmer-Service an die aufrufende Stelle weiter.
   */
  async loadUnternehmer(): Promise<IDatenzugriffEintrag[]> {
    const unternehmer = await this.unternehmerService.loadUnternehmer();
    return unternehmer.map((eintrag) => ({
      id: eintrag.id,
      anzeigename: eintrag.anzeigename,
    }));
  }

  /**
   * Laedt die Firmen eines Unternehmers fuer die Datenzugriffsauswahl.
   *
   * @param unternehmerId - Die Dokument-ID des uebergeordneten Unternehmers.
   * @returns Die IDs und Anzeigenamen der Firmen.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadFirmen(unternehmerId: string): Promise<IDatenzugriffEintrag[]> {
    const firmen = await this.firmaService.loadFirmen(unternehmerId);
    return firmen.map((eintrag) => ({
      id: eintrag.id,
      anzeigename: eintrag.anzeigename,
    }));
  }

  /**
   * Laedt die Filialen einer Firma fuer die Datenzugriffsauswahl.
   *
   * @param unternehmerId - Die Dokument-ID des uebergeordneten Unternehmers.
   * @param firmaId - Die Dokument-ID der uebergeordneten Firma.
   * @returns Die IDs und Anzeigenamen der Filialen.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadFilialen(unternehmerId: string, firmaId: string): Promise<IDatenzugriffEintrag[]> {
    const filialen = await this.filialeService.loadFilialen(unternehmerId, firmaId);
    return filialen.map((eintrag) => ({
      id: eintrag.id,
      anzeigename: eintrag.anzeigename,
    }));
  }
}
