// pur-office/src/app/commons/models/domain/firma.ts

import { Timestamp } from 'firebase/firestore';

import { IAdresse } from './adresse';
import { IKontakt } from './kontakt';

// ===== Anwendungs-Typen ====================

export interface IFirmaAnlage {
  anzeigename: string;
  firmenname: string;
  adresse: IAdresse;
  kontakt: IKontakt;
}

export interface IFirmaAnlageErgebnis {
  id: string;
  nummer: number;
  anzeigename: string;
}

export interface IFirmaEintrag {
  id: string;
  nummer: number;
  anzeigename: string;
}

// ===== Firestore-Dokumente ==================

export interface IFirmaDokument extends IFirmaAnlage {
  nummer: number;
  aktiv: boolean;
  erstelltAm?: Timestamp;
  aktualisiertAm?: Timestamp;
}
