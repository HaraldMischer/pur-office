// pur-office/src/app/commons/utils/auth/technische-anmeldeadresse.spec.ts

import { TUserRole } from '../../models/domain/benutzer';
import {
  buildAnmeldename,
  buildTechnischeAnmeldeadresse,
  normalizeAnmeldename,
  normalizeNamensbestandteil,
  TECHNISCHE_ANMELDE_DOMAIN,
} from './technische-anmeldeadresse';

describe('technische Anmeldeadresse', () => {
  it('normalisiert Leerzeichen, Großschreibung und deutsche Zeichen', () => {
    expect(normalizeNamensbestandteil('  Jörg Weiß  ')).toBe('joergweiss');
  });

  it('entfernt Akzente und Sonderzeichen aus dem Namensbestandteil', () => {
    expect(normalizeNamensbestandteil("Émilie Anne-Marie O'Neil")).toBe('emilieannemarieoneil');
  });

  it.each<TUserRole>(['filiale', 'office', 'mitarbeiter', 'master'])(
    'hängt die Rolle %s an den normalisierten Namensbestandteil an',
    (userRole) => {
      expect(buildAnmeldename('Harald Mischer', userRole)).toBe(`haraldmischer-${userRole}`);
    },
  );

  it.each([
    ['Hagener Str.', 'filiale', 'hagenerstr-filiale@pur-system.invalid'],
    ['Harald Mischer', 'mitarbeiter', 'haraldmischer-mitarbeiter@pur-system.invalid'],
  ] as const)(
    'bildet für %s und die Rolle %s die appabhängige technische Adresse',
    (namensbestandteil, userRole, erwarteteAdresse) => {
      const anmeldename = buildAnmeldename(namensbestandteil, userRole);

      expect(buildTechnischeAnmeldeadresse(anmeldename)).toBe(erwarteteAdresse);
    },
  );

  it('normalisiert einen vollständigen Anmeldenamen und erhält den Rollentrenner', () => {
    expect(normalizeAnmeldename('  HaraldMischer--MASTER  ')).toBe('haraldmischer-master');
  });

  it('bildet die technische Firebase-Adresse mit der gemeinsamen Domain', () => {
    expect(buildTechnischeAnmeldeadresse('HaraldMischer-MASTER')).toBe(
      `haraldmischer-master@${TECHNISCHE_ANMELDE_DOMAIN}`,
    );
  });

  it('liefert für einen leeren oder vollständig entfernten Namen keinen Anmeldenamen', () => {
    expect(normalizeNamensbestandteil(' --- ')).toBe('');
    expect(buildAnmeldename(' --- ', 'master')).toBe('');
    expect(buildTechnischeAnmeldeadresse(' --- ')).toBe('');
  });
});
