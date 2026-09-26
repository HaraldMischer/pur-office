// pur-office/src/app/commons/utils/benutzer/erlaubte-bereiche.ts

import { TAppBereich } from '../../models/app/app-bereich';
import { TUserRole } from '../../models/domain/benutzer';

export type TWaehlbarerAppBereich = Exclude<TAppBereich, 'dashboard' | 'systemverwaltung'>;

type TWaehlbarerAppBereichEintrag = {
  value: TWaehlbarerAppBereich;
  label: string;
};

/**
 * Liefert die optional wählbaren App-Bereiche in ihrer Darstellungsreihenfolge.
 *
 * @returns Die Beschriftungen und Bereichsschlüssel der optionalen Freigaben.
 */
export function getWaehlbareAppBereiche(): ReadonlyArray<TWaehlbarerAppBereichEintrag> {
  return [
    { value: 'schichtplan', label: 'Schichtplan' },
    { value: 'mitarbeiter', label: 'Mitarbeiter' },
    { value: 'verwaltung', label: 'Verwaltung' },
  ];
}

/**
 * Ergänzt die verpflichtenden Bereiche und entfernt unzulässige Systemverwaltungsfreigaben.
 *
 * @param userRole - Die unveränderliche Benutzerrolle.
 * @param bereiche - Die zusätzlich ausgewählten App-Bereiche.
 * @returns Die erlaubten Bereiche in ihrer festgelegten Reihenfolge.
 */
export function buildErlaubteBereiche(
  userRole: TUserRole,
  bereiche: readonly TAppBereich[],
): TAppBereich[] {
  const ausgewaehlteBereiche = new Set(bereiche);
  const erlaubteBereiche: TAppBereich[] = ['dashboard'];

  for (const bereich of getWaehlbareAppBereiche()) {
    if (ausgewaehlteBereiche.has(bereich.value)) {
      erlaubteBereiche.push(bereich.value);
    }
  }

  if (userRole === 'master') {
    erlaubteBereiche.push('systemverwaltung');
  }

  return erlaubteBereiche;
}
