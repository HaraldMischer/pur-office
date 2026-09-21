// pur-office/src/app/commons/models/domain/adresse.ts

export interface IAdresse {
  strasse: string;
  hausnummer: string;
  adresszusatz?: string;
  postleitzahl: string;
  ort: string;
  land: string;
}
