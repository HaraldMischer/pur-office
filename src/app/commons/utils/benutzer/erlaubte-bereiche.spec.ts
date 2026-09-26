// pur-office/src/app/commons/utils/benutzer/erlaubte-bereiche.spec.ts

import { buildErlaubteBereiche, getWaehlbareAppBereiche } from './erlaubte-bereiche';

describe('erlaubte-bereiche', () => {
  it('should expose only optional areas for selection', () => {
    expect(getWaehlbareAppBereiche().map((bereich) => bereich.value)).toEqual([
      'schichtplan',
      'mitarbeiter',
      'verwaltung',
    ]);
  });

  it.each(['office', 'filiale', 'mitarbeiter'] as const)(
    'should always provide dashboard and exclude system administration for %s',
    (userRole) => {
      expect(buildErlaubteBereiche(userRole, ['systemverwaltung'])).toEqual(['dashboard']);
    },
  );

  it('should always provide dashboard and system administration for master', () => {
    expect(buildErlaubteBereiche('master', [])).toEqual(['dashboard', 'systemverwaltung']);
  });

  it('should preserve optional areas once in their configured order', () => {
    expect(
      buildErlaubteBereiche('office', ['verwaltung', 'dashboard', 'schichtplan', 'verwaltung']),
    ).toEqual(['dashboard', 'schichtplan', 'verwaltung']);
  });
});
