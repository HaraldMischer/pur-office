// pur-office/src/app/commons/utils/errors/firebase-error-message.ts

import { IFirebaseErrorLike } from '../../models/app/firebase-error.types';

const FALLBACK_ERROR_MESSAGE = 'Die Aktion konnte nicht ausgefuehrt werden.';

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'E-Mail-Adresse oder Passwort ist nicht korrekt.',
  'auth/invalid-email': 'Bitte gib eine gueltige E-Mail-Adresse ein.',
  'auth/requires-recent-login': 'Bitte melde dich erneut an und versuche es noch einmal.',
  'auth/weak-password': 'Das neue Passwort ist nicht sicher genug.',
  'auth/network-request-failed':
    'Die Verbindung ist fehlgeschlagen. Bitte pruefe deine Internetverbindung.',
  'auth/too-many-requests': 'Zu viele Versuche. Bitte warte kurz und versuche es spaeter erneut.',
  'auth/user-not-found': 'E-Mail-Adresse oder Passwort ist nicht korrekt.',
  'auth/wrong-password': 'E-Mail-Adresse oder Passwort ist nicht korrekt.',
  'permission-denied': 'Du hast keine Berechtigung fuer diese Aktion.',
  'functions/already-exists': 'Zu dieser E-Mail-Adresse besteht bereits ein Benutzerkonto.',
  'functions/internal': 'Der Benutzer konnte nicht vollstaendig angelegt werden.',
  'functions/invalid-argument': 'Die Benutzerdaten sind unvollstaendig oder ungueltig.',
  'functions/permission-denied': 'Nur ein aktiver Master darf Benutzer anlegen.',
  'functions/unauthenticated': 'Bitte melde dich erneut an.',
  'functions/unavailable':
    'Der Dienst ist gerade nicht erreichbar. Bitte versuche es spaeter erneut.',
};

export function getFirebaseErrorMessage(error: unknown): string {
  if (!isFirebaseErrorLike(error) || !error.code) {
    return FALLBACK_ERROR_MESSAGE;
  }

  return FIREBASE_ERROR_MESSAGES[error.code] ?? FALLBACK_ERROR_MESSAGE;
}

function isFirebaseErrorLike(error: unknown): error is IFirebaseErrorLike {
  return typeof error === 'object' && error !== null;
}
