// pur-office/src/app/commons/utils/navigation/rollen-navigation.spec.ts

import { TNavigationEintrag } from '../../models/app/navigation';
import { IBenutzerProfilDokument, TUserRole } from '../../models/domain/benutzer';
import { getNavigationLinks, getSichtbareRollenNavigation } from './rollen-navigation';

function createProfil(
  userRole: TUserRole,
  erlaubteBereiche: IBenutzerProfilDokument['erlaubteBereiche'],
  aktiv = true,
): IBenutzerProfilDokument {
  return {
    email: 'test@example.com',
    anzeigename: 'Test',
    aktiv,
    userRole,
    erlaubteBereiche,
    zugriffe: {},
  };
}

describe('rollen-navigation', () => {
  it('should combine the role navigation with the allowed areas', () => {
    const navigation = getSichtbareRollenNavigation(
      createProfil('office', ['dashboard', 'verwaltung', 'systemverwaltung']),
    );

    expect(navigation.darstellung).toBe('flat');
    expect(navigation.eintraege.map((eintrag) => eintrag.id)).toEqual(['dashboard', 'verwaltung']);
  });

  it('should preserve the configured nested renderer for master', () => {
    const navigation = getSichtbareRollenNavigation(
      createProfil('master', ['dashboard', 'systemverwaltung']),
    );

    expect(navigation.darstellung).toBe('nested');
    expect(navigation.eintraege.map((eintrag) => eintrag.id)).toEqual([
      'dashboard',
      'systemverwaltung',
    ]);
  });

  it('should provide no entries for an inactive profile', () => {
    const navigation = getSichtbareRollenNavigation(
      createProfil('master', ['dashboard', 'systemverwaltung'], false),
    );

    expect(navigation.eintraege).toEqual([]);
  });

  it('should flatten nested navigation links in their configured order', () => {
    const eintraege: readonly TNavigationEintrag[] = [
      {
        typ: 'link',
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
        bereich: 'dashboard',
      },
      {
        typ: 'gruppe',
        id: 'systemverwaltung',
        label: 'Systemverwaltung',
        icon: 'admin_panel_settings',
        kinder: [
          {
            typ: 'link',
            id: 'datenstruktur',
            label: 'Datenstruktur anlegen',
            icon: 'account_tree',
            route: '/systemverwaltung/datenstruktur',
            bereich: 'systemverwaltung',
          },
          {
            typ: 'link',
            id: 'benutzer',
            label: 'Benutzerverwaltung',
            icon: 'manage_accounts',
            route: '/systemverwaltung/benutzer',
            bereich: 'systemverwaltung',
          },
        ],
      },
    ];

    expect(getNavigationLinks(eintraege).map((eintrag) => eintrag.id)).toEqual([
      'dashboard',
      'datenstruktur',
      'benutzer',
    ]);
  });
});
