// pur-office/functions/src/create-benutzer.ts

import { HttpsError } from 'firebase-functions/v2/https';

import {
  buildAnmeldename,
  buildTechnischeAnmeldeadresse,
  normalizeNamensbestandteil,
} from './technische-anmeldeadresse';

const USER_ROLES = ['filiale', 'office', 'master', 'mitarbeiter'] as const;
const APP_BEREICHE = [
  'dashboard',
  'schichtplan',
  'mitarbeiter',
  'verwaltung',
  'systemverwaltung',
] as const;
const WAEHLBARE_APP_BEREICHE = ['schichtplan', 'mitarbeiter', 'verwaltung'] as const;

type TUserRole = (typeof USER_ROLES)[number];
type TAppBereich = (typeof APP_BEREICHE)[number];

type TBenutzerZugriffe = Record<string, Record<string, string[]>>;

export interface ICreateBenutzerData {
  namensbestandteil: string;
  anzeigename: string;
  userRole: TUserRole;
  erlaubteBereiche: TAppBereich[];
  zugriffe: TBenutzerZugriffe;
  passwort: string;
}

export interface ICreateBenutzerResult {
  uid: string;
  anmeldename: string;
  email: string;
}

interface ICreateBenutzerProfilData {
  anmeldename: string;
  email: string;
  anzeigename: string;
  userRole: TUserRole;
  erlaubteBereiche: TAppBereich[];
  zugriffe: TBenutzerZugriffe;
}

interface IParsedCreateBenutzerData extends ICreateBenutzerProfilData {
  passwort: string;
}

interface ICreateBenutzerRequest {
  auth: { uid: string } | null | undefined;
  data: unknown;
}

interface ICreateBenutzerDependencies {
  getBenutzerProfil(uid: string): Promise<unknown>;
  existierenDokumente(pfade: readonly string[]): Promise<boolean>;
  createAuthBenutzer(data: {
    email: string;
    displayName: string;
    password: string;
    disabled: true;
  }): Promise<{ uid: string }>;
  setBenutzerProfilDokument(uid: string, data: ICreateBenutzerProfilData): Promise<void>;
  setAuthBenutzerDisabled(uid: string, disabled: boolean): Promise<void>;
  deactivateBenutzerProfilDokument(uid: string): Promise<void>;
  logAnlageError(uid: string, schritt: string, error: unknown): void;
  deleteAuthBenutzer(uid: string): Promise<void>;
  logRollbackError(uid: string, error: unknown): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isDokumentId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    !value.includes('/') &&
    !['.', '..'].includes(value.trim())
  );
}

function parseZugriffe(value: unknown): TBenutzerZugriffe {
  if (!isRecord(value)) {
    throw new HttpsError('invalid-argument', 'Zugriffe müssen als Objekt übergeben werden.');
  }

  const unternehmer = new Map<string, Map<string, string[]>>();
  for (const [roheUnternehmerId, firmenValue] of Object.entries(value)) {
    if (!isDokumentId(roheUnternehmerId) || !isRecord(firmenValue)) {
      throw new HttpsError(
        'invalid-argument',
        'Jeder Zugriff benötigt einen gültigen Unternehmer.',
      );
    }

    const unternehmerId = roheUnternehmerId.trim();
    const firmen = unternehmer.get(unternehmerId) ?? new Map<string, string[]>();
    for (const [roheFirmaId, filialIdsValue] of Object.entries(firmenValue)) {
      if (
        !isDokumentId(roheFirmaId) ||
        !isStringArray(filialIdsValue) ||
        filialIdsValue.length === 0 ||
        !filialIdsValue.every(isDokumentId)
      ) {
        throw new HttpsError(
          'invalid-argument',
          'Jede Firma benötigt mindestens eine gültige Filiale.',
        );
      }

      const firmaId = roheFirmaId.trim();
      firmen.set(firmaId, [
        ...new Set([
          ...(firmen.get(firmaId) ?? []),
          ...filialIdsValue.map((filialId) => filialId.trim()),
        ]),
      ]);
    }
    if (firmen.size === 0) {
      throw new HttpsError('invalid-argument', 'Jeder Unternehmer benötigt mindestens eine Firma.');
    }
    unternehmer.set(unternehmerId, firmen);
  }

  return Object.fromEntries(
    [...unternehmer].map(([unternehmerId, firmen]) => [unternehmerId, Object.fromEntries(firmen)]),
  );
}

function parseCreateBenutzerData(value: unknown): IParsedCreateBenutzerData {
  if (!isRecord(value)) {
    throw new HttpsError('invalid-argument', 'Benutzerdaten fehlen.');
  }

  const namensbestandteil =
    typeof value['namensbestandteil'] === 'string'
      ? normalizeNamensbestandteil(value['namensbestandteil'])
      : '';
  const anzeigename = typeof value['anzeigename'] === 'string' ? value['anzeigename'].trim() : '';
  const userRole = value['userRole'];
  const erlaubteBereiche = value['erlaubteBereiche'];
  const passwort = typeof value['passwort'] === 'string' ? value['passwort'] : undefined;

  if (!namensbestandteil) {
    throw new HttpsError('invalid-argument', 'Ein gültiger Namensbestandteil ist erforderlich.');
  }

  if (!anzeigename) {
    throw new HttpsError('invalid-argument', 'Ein Anzeigename ist erforderlich.');
  }

  if (typeof userRole !== 'string' || !USER_ROLES.includes(userRole as TUserRole)) {
    throw new HttpsError('invalid-argument', 'Die Benutzerrolle ist ungültig.');
  }

  const anmeldename = buildAnmeldename(namensbestandteil, userRole);
  const email = buildTechnischeAnmeldeadresse(anmeldename);

  if (
    !isStringArray(erlaubteBereiche) ||
    erlaubteBereiche.some((bereich) => !APP_BEREICHE.includes(bereich as TAppBereich))
  ) {
    throw new HttpsError('invalid-argument', 'Die erlaubten Bereiche sind ungültig.');
  }

  if (!passwort || passwort.length < 8) {
    throw new HttpsError(
      'invalid-argument',
      'Das Anfangspasswort muss mindestens 8 Zeichen haben.',
    );
  }

  const ausgewaehlteBereiche = new Set(erlaubteBereiche);
  const normalisierteBereiche: TAppBereich[] = [
    'dashboard',
    ...WAEHLBARE_APP_BEREICHE.filter((bereich) => ausgewaehlteBereiche.has(bereich)),
  ];
  if (userRole === 'master') {
    normalisierteBereiche.push('systemverwaltung');
  }

  return {
    anmeldename,
    email,
    anzeigename,
    userRole: userRole as TUserRole,
    erlaubteBereiche: normalisierteBereiche,
    zugriffe: parseZugriffe(value['zugriffe']),
    passwort,
  };
}

function mapAuthError(error: unknown): HttpsError {
  const code = isRecord(error) && typeof error['code'] === 'string' ? error['code'] : '';

  if (code === 'auth/email-already-exists') {
    return new HttpsError(
      'already-exists',
      'Für diesen Anmeldenamen existiert bereits ein Konto. Bitte einen anderen Namensbestandteil verwenden.',
    );
  }

  if (code === 'auth/invalid-email') {
    return new HttpsError('internal', 'Die technische Anmeldeadresse konnte nicht erzeugt werden.');
  }

  return new HttpsError('internal', 'Der Auth-Benutzer konnte nicht angelegt werden.');
}

export async function handleCreateBenutzer(
  request: ICreateBenutzerRequest,
  dependencies: ICreateBenutzerDependencies,
): Promise<ICreateBenutzerResult> {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Anmeldung erforderlich.');
  }

  const masterProfil = await dependencies.getBenutzerProfil(request.auth.uid);

  if (
    !isRecord(masterProfil) ||
    masterProfil['aktiv'] !== true ||
    masterProfil['userRole'] !== 'master'
  ) {
    throw new HttpsError('permission-denied', 'Nur aktive Master dürfen Benutzer anlegen.');
  }

  const data = parseCreateBenutzerData(request.data);
  const zugriffsEintraege = Object.entries(data.zugriffe).flatMap(([unternehmerId, firmen]) =>
    Object.entries(firmen).map(([firmaId, filialIds]) => ({
      unternehmerId,
      firmaId,
      filialIds,
    })),
  );
  if (data.userRole === 'mitarbeiter' && zugriffsEintraege.length > 0) {
    throw new HttpsError(
      'invalid-argument',
      'Mitarbeiterzugänge dürfen noch keine fachliche Datenzuordnung besitzen.',
    );
  }
  if (
    data.userRole !== 'master' &&
    data.userRole !== 'mitarbeiter' &&
    zugriffsEintraege.length === 0
  ) {
    throw new HttpsError(
      'invalid-argument',
      'Office- und Filialkonten benötigen mindestens eine vollständige Datenzuordnung.',
    );
  }
  if (
    data.userRole === 'filiale' &&
    (Object.keys(data.zugriffe).length !== 1 ||
      zugriffsEintraege.length !== 1 ||
      zugriffsEintraege[0].filialIds.length !== 1)
  ) {
    throw new HttpsError(
      'invalid-argument',
      'Filialkonten benötigen genau eine Firma mit genau einer Filiale.',
    );
  }
  const pfade = [
    ...new Set(
      zugriffsEintraege.flatMap((zugriff) => {
        const unternehmer = `unternehmer/${zugriff.unternehmerId}`;
        const firma = `${unternehmer}/firma/${zugriff.firmaId}`;
        return [unternehmer, firma, ...zugriff.filialIds.map((id) => `${firma}/filiale/${id}`)];
      }),
    ),
  ];
  if (pfade.length > 0) {
    let vorhanden: boolean;
    try {
      vorhanden = await dependencies.existierenDokumente(pfade);
    } catch {
      throw new HttpsError(
        'unavailable',
        'Die Datenzugriffe konnten nicht geprüft werden. Bitte erneut versuchen.',
      );
    }
    if (!vorhanden) {
      throw new HttpsError(
        'invalid-argument',
        'Die gewählten Unternehmer, Firmen oder Filialen existieren nicht in dieser Zuordnung.',
      );
    }
  }
  let authBenutzer: { uid: string };

  try {
    authBenutzer = await dependencies.createAuthBenutzer({
      email: data.email,
      displayName: data.anzeigename,
      password: data.passwort,
      disabled: true,
    });
  } catch (error: unknown) {
    throw mapAuthError(error);
  }

  let aktivierungVersucht = false;
  try {
    const { passwort, ...benutzerProfilDokument } = data;
    await dependencies.setBenutzerProfilDokument(authBenutzer.uid, benutzerProfilDokument);

    aktivierungVersucht = true;
    await dependencies.setAuthBenutzerDisabled(authBenutzer.uid, false);

    return {
      uid: authBenutzer.uid,
      anmeldename: data.anmeldename,
      email: data.email,
    };
  } catch (error: unknown) {
    dependencies.logAnlageError(
      authBenutzer.uid,
      aktivierungVersucht ? 'aktivierung' : 'profil',
      error,
    );
    let bereinigungFehlgeschlagen = false;
    if (aktivierungVersucht) {
      // Ein Fehler kann auch nach erfolgreicher Aktivierung auftreten (z. B. Timeout).
      // Das Profil bleibt erhalten, damit vorhandene Tokens nie Legacy-Rechte erhalten.
      for (const [schritt, bereinigen] of [
        ['auth-deaktivieren', () => dependencies.setAuthBenutzerDisabled(authBenutzer.uid, true)],
        [
          'profil-deaktivieren',
          () => dependencies.deactivateBenutzerProfilDokument(authBenutzer.uid),
        ],
      ] as const) {
        try {
          await bereinigen();
        } catch (cleanupError: unknown) {
          bereinigungFehlgeschlagen = true;
          dependencies.logAnlageError(authBenutzer.uid, schritt, cleanupError);
        }
      }
    }
    try {
      await dependencies.deleteAuthBenutzer(authBenutzer.uid);
    } catch (rollbackError: unknown) {
      bereinigungFehlgeschlagen = true;
      dependencies.logRollbackError(authBenutzer.uid, rollbackError);
    }

    throw new HttpsError(
      'internal',
      bereinigungFehlgeschlagen
        ? 'Die Benutzeranlage ist fehlgeschlagen. Die Bereinigung ist unvollständig; bitte den Administrator zur Prüfung verständigen.'
        : 'Die Benutzeranlage ist fehlgeschlagen. Das Auth-Konto wurde entfernt; ein eventuell gespeichertes Profil bleibt zur Absicherung erhalten.',
    );
  }
}
