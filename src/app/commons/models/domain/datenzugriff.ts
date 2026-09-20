// pur-office/src/app/commons/models/domain/datenzugriff.ts

export interface IDatenzugriffEintrag {
  id: string;
  name: string;
}

// Unternehmer-Auswahl
export interface IUnternehmerAuswahl {
  id: string;
  name: string;
  firmen: readonly IFirmaAuswahl[];
}

// Firmen-Auswahl
export interface IFirmaAuswahl {
  id: string;
  name: string;
  filialen: readonly IFilialeAuswahl[];
}

// Filial-Auswahl
export interface IFilialeAuswahl {
  id: string;
  name: string;
}
