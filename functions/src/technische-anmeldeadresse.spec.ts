// pur-office/functions/src/technische-anmeldeadresse.spec.ts

import { describe, expect, it } from 'vitest';

import {
  buildAnmeldename,
  buildTechnischeAnmeldeadresse,
  normalizeNamensbestandteil,
} from './technische-anmeldeadresse';

describe('technische Anmeldeadresse', () => {
  it('normalisiert Namen mit Leerzeichen, Umlauten und Sonderzeichen', () => {
    expect(normalizeNamensbestandteil('  HÄRÄLD Míßer!  ')).toBe('haeraeldmisser');
  });

  it.each(['filiale', 'office', 'mitarbeiter', 'master'])(
    'hängt die Rolle %s an den Namensbestandteil an',
    (userRole) => {
      expect(buildAnmeldename('Harald Mischer', userRole)).toBe(`haraldmischer-${userRole}`);
    },
  );

  it('bildet die technische Firebase-Adresse', () => {
    expect(buildTechnischeAnmeldeadresse('haraldmischer-master')).toBe(
      'haraldmischer-master@pur-system.invalid',
    );
  });
});
