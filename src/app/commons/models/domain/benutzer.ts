// pur-office/src/app/commons/models/domain/benutzer.ts

import { Timestamp } from 'firebase/firestore';
import { TAppBereich } from '../app/app-bereich';

export type TUserRole = 'filiale' | 'office' | 'master';
export type TBenutzerZugriffe = Record<string, Record<string, string[]>>;

// ===== Anwendungs-Typen ====================

export interface IBenutzerAnlage {
  email: string;
  anzeigename: string;
  userRole: TUserRole;
  erlaubteBereiche: TAppBereich[];
  zugriffe: TBenutzerZugriffe;
  passwort: string;
}

export interface IBenutzerAnlageErgebnis {
  uid: string;
  email: string;
}

export interface IBenutzerProfilEintrag extends IBenutzerProfilDokument {
  uid: string;
}

export interface IBenutzerProfilAktualisierung {
  anzeigename: string;
  aktiv: boolean;
  userRole: TUserRole;
  erlaubteBereiche: TAppBereich[];
  zugriffe: TBenutzerZugriffe;
}

// ===== Firestore-Dokumente ==================

export interface IBenutzerProfilDokument {
  email: string;
  anzeigename: string;
  aktiv: boolean;
  userRole: TUserRole;
  erlaubteBereiche: TAppBereich[];
  zugriffe: TBenutzerZugriffe;
  erstelltAm?: Timestamp;
  aktualisiertAm?: Timestamp;
}
