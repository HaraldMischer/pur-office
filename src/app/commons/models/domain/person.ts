// pur-office/src/app/commons/models/domain/person.ts

export interface IPerson {
  vorname: string;
  nachname: string;
  geburtstag?: string;
  geschlecht?: EGender;
}

export enum EGender {
  FEMALE = 'weiblich',
  GENDERLESS = 'divers',
  MALE = 'männlich',
}
