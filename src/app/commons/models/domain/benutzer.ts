// pur-office/src/app/commons/models/domain/benutzer.ts

import { Timestamp } from 'firebase/firestore';

import { TAppBereich } from '../app/app-bereich';

export type TUserRole = 'filiale' | 'office' | 'master';

// ===== Anwendungs-Typen ====================

export interface IBenutzerAnlage {
  email: string;
  anzeigename: string;
  userRole: TUserRole;
  erlaubteBereiche: TAppBereich[];
  zugriffe: IBenutzerZugriff[];
  passwort: string;
}

export interface IBenutzerAnlageErgebnis {
  uid: string;
  email: string;
}

// ===== Firestore-Dokumente ==================

export interface IBenutzerDokument {
  uid: string;
  email: string;
  anzeigename: string | null;
  aktiv: boolean;
  userRole: TUserRole;
  erlaubteBereiche: TAppBereich[];
  zugriffe: IBenutzerZugriff[];
  erstelltAm?: Timestamp;
  aktualisiertAm?: Timestamp;
}

// ===== Firestore-Typen ======================

export interface IBenutzerZugriff {
  firmaId: string;
  filialIds: string[];
}
