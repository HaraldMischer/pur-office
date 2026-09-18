// pur-office/src/app/commons/models/domain/datenzugriff.ts

export interface IFilialeAuswahl {
  id: string;
  name: string;
}

export interface IFirmaAuswahl {
  id: string;
  name: string;
  filialen: readonly IFilialeAuswahl[];
}

export interface IUnternehmerAuswahl {
  id: string;
  name: string;
  firmen: readonly IFirmaAuswahl[];
}
