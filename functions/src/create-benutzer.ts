// pur-office/functions/src/create-benutzer.ts

import { HttpsError } from 'firebase-functions/v2/https';

const USER_ROLES = ['filiale', 'office', 'master'] as const;
const APP_BEREICHE = ['dashboard', 'schichtplan', 'mitarbeiter', 'verwaltung'] as const;

type TUserRole = (typeof USER_ROLES)[number];
type TAppBereich = (typeof APP_BEREICHE)[number];

interface IBenutzerZugriff {
  firmaId: string;
  filialIds: string[];
}

export interface ICreateBenutzerData {
  email: string;
  anzeigename: string;
  userRole: TUserRole;
  erlaubteBereiche: TAppBereich[];
  zugriffe: IBenutzerZugriff[];
  passwort: string;
}

export interface ICreateBenutzerResult {
  uid: string;
  email: string;
}

interface ICreateBenutzerRequest {
  auth: { uid: string } | null | undefined;
  data: unknown;
}

interface ICreateBenutzerDependencies {
  getBenutzerProfil(uid: string): Promise<unknown>;
  createAuthBenutzer(data: {
    email: string;
    displayName: string;
    password: string;
  }): Promise<{ uid: string }>;
  setBenutzerDokument(uid: string, data: Omit<ICreateBenutzerData, 'passwort'>): Promise<void>;
  deleteAuthBenutzer(uid: string): Promise<void>;
  logRollbackError(uid: string, error: unknown): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function parseZugriffe(value: unknown): IBenutzerZugriff[] {
  if (!Array.isArray(value)) {
    throw new HttpsError('invalid-argument', 'Zugriffe müssen als Liste übergeben werden.');
  }

  return value.map((zugriff) => {
    if (
      !isRecord(zugriff) ||
      typeof zugriff['firmaId'] !== 'string' ||
      !zugriff['firmaId'].trim() ||
      !isStringArray(zugriff['filialIds']) ||
      zugriff['filialIds'].length === 0 ||
      zugriff['filialIds'].some((filialId) => !filialId.trim())
    ) {
      throw new HttpsError(
        'invalid-argument',
        'Jeder Zugriff benötigt eine Firma und mindestens eine Filiale.',
      );
    }

    return {
      firmaId: zugriff['firmaId'].trim(),
      filialIds: [...new Set(zugriff['filialIds'].map((filialId) => filialId.trim()))],
    };
  });
}

function parseCreateBenutzerData(value: unknown): ICreateBenutzerData {
  if (!isRecord(value)) {
    throw new HttpsError('invalid-argument', 'Benutzerdaten fehlen.');
  }

  const email = typeof value['email'] === 'string' ? value['email'].trim().toLowerCase() : '';
  const anzeigename = typeof value['anzeigename'] === 'string' ? value['anzeigename'].trim() : '';
  const userRole = value['userRole'];
  const erlaubteBereiche = value['erlaubteBereiche'];
  const passwort = typeof value['passwort'] === 'string' ? value['passwort'] : undefined;

  if (!email || !email.includes('@')) {
    throw new HttpsError('invalid-argument', 'Eine gültige E-Mail-Adresse ist erforderlich.');
  }

  if (!anzeigename) {
    throw new HttpsError('invalid-argument', 'Ein Anzeigename ist erforderlich.');
  }

  if (typeof userRole !== 'string' || !USER_ROLES.includes(userRole as TUserRole)) {
    throw new HttpsError('invalid-argument', 'Die Benutzerrolle ist ungültig.');
  }

  if (
    !isStringArray(erlaubteBereiche) ||
    erlaubteBereiche.length === 0 ||
    erlaubteBereiche.some((bereich) => !APP_BEREICHE.includes(bereich as TAppBereich))
  ) {
    throw new HttpsError('invalid-argument', 'Mindestens ein gültiger Bereich ist erforderlich.');
  }

  if (!passwort || passwort.length < 8) {
    throw new HttpsError(
      'invalid-argument',
      'Das Anfangspasswort muss mindestens 8 Zeichen haben.',
    );
  }

  return {
    email,
    anzeigename,
    userRole: userRole as TUserRole,
    erlaubteBereiche: [...new Set(erlaubteBereiche)] as TAppBereich[],
    zugriffe: parseZugriffe(value['zugriffe']),
    passwort,
  };
}

function mapAuthError(error: unknown): HttpsError {
  const code = isRecord(error) && typeof error['code'] === 'string' ? error['code'] : '';

  if (code === 'auth/email-already-exists') {
    return new HttpsError(
      'already-exists',
      'Für diese E-Mail-Adresse existiert bereits ein Konto.',
    );
  }

  if (code === 'auth/invalid-email') {
    return new HttpsError('invalid-argument', 'Die E-Mail-Adresse ist ungültig.');
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
  let authBenutzer: { uid: string };

  try {
    authBenutzer = await dependencies.createAuthBenutzer({
      email: data.email,
      displayName: data.anzeigename,
      password: data.passwort,
    });
  } catch (error: unknown) {
    throw mapAuthError(error);
  }

  try {
    const { passwort, ...benutzerDokument } = data;
    await dependencies.setBenutzerDokument(authBenutzer.uid, benutzerDokument);

    return {
      uid: authBenutzer.uid,
      email: data.email,
    };
  } catch (error: unknown) {
    try {
      await dependencies.deleteAuthBenutzer(authBenutzer.uid);
    } catch (rollbackError: unknown) {
      dependencies.logRollbackError(authBenutzer.uid, rollbackError);
    }

    throw new HttpsError(
      'internal',
      'Der Benutzerzugang konnte nicht vollständig angelegt werden. Die Anlage wurde zurückgesetzt.',
    );
  }
}
