// pur-office/src/app/services/firebase/firestore-db.service.ts

import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { DocumentData, FieldValue, Firestore } from '@angular/fire/firestore';

import {
  FIRESTORE_ADD_DOC,
  FIRESTORE_COLLECTION,
  FIRESTORE_DOC,
  FIRESTORE_GET_DOC,
  FIRESTORE_GET_DOCS,
  FIRESTORE_SERVER_TIMESTAMP,
  FIRESTORE_SET_DOC,
} from '../../commons/tokens/firebase.tokens';
import { LoadingService } from '../core/loading.service';

export interface IFirestoreDokument<T extends DocumentData> {
  id: string;
  daten: T;
}

@Injectable({ providedIn: 'root' })
export class FirestoreDbService {
  // ===== Interne Dependency Injection =========

  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly firestore = inject(Firestore);
  private readonly addDoc = inject(FIRESTORE_ADD_DOC);
  private readonly collection = inject(FIRESTORE_COLLECTION);
  private readonly doc = inject(FIRESTORE_DOC);
  private readonly getDoc = inject(FIRESTORE_GET_DOC);
  private readonly getDocs = inject(FIRESTORE_GET_DOCS);
  private readonly loadingService = inject(LoadingService);
  private readonly serverTimestamp = inject(FIRESTORE_SERVER_TIMESTAMP);
  private readonly setDoc = inject(FIRESTORE_SET_DOC);

  // ===== Oeffentliche Aktionen =================

  /**
   * Laedt alle Dokumente einer Firestore-Collection.
   *
   * @param collectionPath - Vollstaendiger Pfad der Collection.
   * @returns Dokument-IDs und unveraenderte Firestore-Daten.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadCollection<T extends DocumentData>(
    collectionPath: string,
  ): Promise<IFirestoreDokument<T>[]> {
    return this.loadingService.trackLoad(async () => {
      const snapshot = await this.runInContext(() => {
        const collectionRef = this.collection(this.firestore, collectionPath);
        return this.getDocs(collectionRef);
      });

      return snapshot.docs.map((dokument) => {
        return {
          id: dokument.id,
          daten: dokument.data() as T,
        };
      });
    });
  }

  /**
   * Laedt ein einzelnes Firestore-Dokument.
   *
   * @param documentPath - Vollstaendiger Pfad des Dokuments.
   * @returns Dokument-ID und Daten oder `null`, wenn das Dokument nicht existiert.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async loadDocument<T extends DocumentData>(
    documentPath: string,
  ): Promise<IFirestoreDokument<T> | null> {
    return this.loadingService.trackLoad(async () => {
      const snapshot = await this.runInContext(() => {
        const documentRef = this.doc(this.firestore, documentPath);
        return this.getDoc(documentRef);
      });

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        daten: snapshot.data() as T,
      };
    });
  }

  /**
   * Legt ein Dokument mit automatisch erzeugter Dokument-ID an.
   *
   * @param collectionPath - Vollstaendiger Pfad der Ziel-Collection.
   * @param daten - Zu speichernde Dokumentdaten.
   * @returns Die von Firestore erzeugte Dokument-ID.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async createDocument<T extends DocumentData>(collectionPath: string, daten: T): Promise<string> {
    const dokumentRef = await this.runInContext(() => {
      const collectionRef = this.collection(this.firestore, collectionPath);
      return this.addDoc(collectionRef, daten);
    });

    return dokumentRef.id;
  }

  /**
   * Aktualisiert ein Dokument, ohne nicht uebergebene Felder zu entfernen.
   *
   * @param documentPath - Vollstaendiger Pfad des Dokuments.
   * @param daten - Zu aktualisierende Dokumentfelder.
   * @returns Ein Promise, das nach dem bestaetigten Schreibvorgang abgeschlossen ist.
   * @throws Gibt Fehler des Firestore-Zugriffs an die aufrufende Stelle weiter.
   */
  async updateDocument<T extends DocumentData>(documentPath: string, daten: T): Promise<void> {
    await this.runInContext(() => {
      const documentRef = this.doc(this.firestore, documentPath);
      return this.setDoc(documentRef, daten, { merge: true });
    });
  }

  /**
   * Erzeugt einen serverseitig aufgeloesten Firestore-Zeitstempel.
   *
   * @returns Platzhalter fuer den Firestore-Server-Zeitstempel.
   */
  createServerTimestamp(): FieldValue {
    return this.serverTimestamp();
  }

  // ===== Interne Helfer =======================

  private runInContext<T>(aktion: () => T): T {
    return runInInjectionContext(this.environmentInjector, aktion);
  }
}
