// pur-office/src/app/commons/models/domain/benutzer.ts

import { Timestamp } from 'firebase/firestore';

import { TAppBereich } from '../app/app-bereich';

export type TUserRole = 'filiale' | 'office' | 'master';
export type TZugangsart = 'master-passwort' | 'einrichtungslink';

// ===== Anwendungs-Typen ====================

export interface IBenutzerAnlage {
  email: string;
  anzeigename: string;
  userRole: TUserRole;
  erlaubteBereiche: TAppBereich[];
  zugriffe: IBenutzerZugriff[];
  zugangsart: TZugangsart;
  passwort?: string;
}

export interface IBenutzerAnlageErgebnis {
  uid: string;
  email: string;
  passwortEinrichtungslink: string | null;
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
