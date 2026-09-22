// pur-office/src/app/services/core/loading.service.ts

import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  // ===== Interner State =======================

  private readonly _aktiveLadevorgaenge = signal(0);

  // ===== Oeffentliche Ableitungen ==============

  readonly isLoading = computed(() => {
    return this._aktiveLadevorgaenge() > 0;
  });

  // ===== Oeffentliche Aktionen =================

  /**
   * Registriert einen asynchronen Ladevorgang fuer den globalen Ladeindikator.
   *
   * Parallel laufende Aufrufe werden gezaehlt, damit der Ladeindikator erst nach Abschluss
   * des letzten Aufrufs ausgeblendet wird.
   *
   * @param load - Die auszufuehrende asynchrone Ladefunktion.
   * @returns Das Ergebnis der Ladefunktion.
   * @throws Gibt Fehler der Ladefunktion unveraendert an die aufrufende Stelle weiter.
   */
  async trackLoad<T>(load: () => Promise<T>): Promise<T> {
    this._aktiveLadevorgaenge.update((anzahl) => anzahl + 1);

    try {
      return await load();
    } finally {
      this._aktiveLadevorgaenge.update((anzahl) => Math.max(0, anzahl - 1));
    }
  }
}
