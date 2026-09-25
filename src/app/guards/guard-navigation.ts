// pur-office/src/app/guards/guard-navigation.ts

import { TAppBereich } from '../commons/models/app/app-bereich';
import { IBenutzerProfilDokument } from '../commons/models/domain/benutzer';

const BEREICH_ROUTES: Record<TAppBereich, string> = {
  dashboard: '/dashboard',
  schichtplan: '/schichtplan',
  mitarbeiter: '/mitarbeiter',
  verwaltung: '/verwaltung',
  systemverwaltung: '/systemverwaltung',
};

/**
 * Ermittelt eine tatsächlich erreichbare Ausweichroute für das Benutzerprofil.
 *
 * @param profil - Das aktive Benutzerprofil mit Rolle und Bereichsfreigaben.
 * @returns Die bevorzugte erlaubte Route oder `null`, wenn keine erreichbar ist.
 */
export function getErlaubteStartRoute(profil: IBenutzerProfilDokument): string | null {
  const erreichbareBereiche = profil.erlaubteBereiche.filter((bereich) => {
    if (bereich === 'systemverwaltung') return profil.userRole === 'master';
    if (bereich === 'verwaltung') {
      return profil.userRole === 'office' || profil.userRole === 'master';
    }
    return true;
  });
  const startBereich = erreichbareBereiche.includes('dashboard')
    ? 'dashboard'
    : erreichbareBereiche[0];

  return startBereich ? BEREICH_ROUTES[startBereich] : null;
}
