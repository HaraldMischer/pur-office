// pur-office/src/app/commons/models/domain/unternehmer.ts

import { Timestamp } from 'firebase/firestore';
import { IAdresse } from './adresse';
import { IKontakt } from './kontakt';

// ===== Anwendungs-Typen ====================
export interface IUnternehmerAnlage {
  name: string;
  adresse: IAdresse;
  kontakt: IKontakt;
}

export interface IUnternehmerAnlageErgebnis {
  id: string;
  nummer: number;
  name: string;
}

export interface IUnternehmerEintrag {
  id: string;
  nummer: number;
  name: string;
}

// ===== Firestore-Dokumente ==================
export interface IUnternehmerDokument extends IUnternehmerAnlage {
  nummer: number;
  aktiv: boolean;
  erstelltAm?: Timestamp;
  aktualisiertAm?: Timestamp;
}
