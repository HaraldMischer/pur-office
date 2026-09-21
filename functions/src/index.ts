// pur-office/functions/src/index.ts

import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onCall } from 'firebase-functions/v2/https';

import {
  handleCreateBenutzer,
  ICreateBenutzerData,
  ICreateBenutzerResult,
} from './create-benutzer';

const app = getApps().length > 0 ? getApp() : initializeApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

export const createBenutzer = onCall<ICreateBenutzerData, Promise<ICreateBenutzerResult>>(
  { region: 'europe-west1' },
  async (request) =>
    handleCreateBenutzer(
      { auth: request.auth, data: request.data },
      {
        getBenutzerProfil: async (uid) => {
          const snapshot = await firestore.doc(`benutzerprofil/${uid}`).get();
          return snapshot.exists ? snapshot.data() : null;
        },
        existierenDokumente: async (pfade) => {
          const dokumente = await firestore.getAll(...pfade.map((pfad) => firestore.doc(pfad)));
          return dokumente.every((dokument) => dokument.exists);
        },
        createAuthBenutzer: (data) =>
          auth.createUser({
            email: data.email,
            displayName: data.displayName,
            password: data.password,
            disabled: data.disabled,
            emailVerified: false,
          }),
        setBenutzerProfilDokument: async (uid, data) => {
          await firestore.doc(`benutzerprofil/${uid}`).set({
            email: data.email,
            anzeigename: data.anzeigename,
            aktiv: true,
            userRole: data.userRole,
            erlaubteBereiche: data.erlaubteBereiche,
            zugriffe: data.zugriffe,
            erstelltAm: FieldValue.serverTimestamp(),
            aktualisiertAm: FieldValue.serverTimestamp(),
          });
        },
        setAuthBenutzerDisabled: async (uid, disabled) => {
          await auth.updateUser(uid, { disabled });
        },
        deactivateBenutzerProfilDokument: async (uid) => {
          await firestore.doc(`benutzerprofil/${uid}`).update({
            aktiv: false,
            aktualisiertAm: FieldValue.serverTimestamp(),
          });
        },
        logAnlageError: (uid, schritt, error) => {
          logger.error('Benutzeranlage fehlgeschlagen; Konto und Profil pruefen.', {
            uid,
            schritt,
            error,
          });
        },
        deleteAuthBenutzer: (uid) => auth.deleteUser(uid),
        logRollbackError: (uid, error) => {
          logger.error('Auth-Benutzer konnte beim Rollback nicht entfernt werden.', { uid, error });
        },
      },
    ),
);
