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
          const snapshot = await firestore.doc(`benutzer/${uid}`).get();
          return snapshot.exists ? snapshot.data() : null;
        },
        createAuthBenutzer: (data) =>
          auth.createUser({
            email: data.email,
            displayName: data.displayName,
            ...(data.password ? { password: data.password } : {}),
            disabled: false,
            emailVerified: false,
          }),
        generatePasswordResetLink: (email) => auth.generatePasswordResetLink(email),
        setBenutzerDokument: async (uid, data) => {
          await firestore.doc(`benutzer/${uid}`).set({
            uid,
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
        deleteAuthBenutzer: (uid) => auth.deleteUser(uid),
        logRollbackError: (uid, error) => {
          logger.error('Auth-Benutzer konnte beim Rollback nicht entfernt werden.', { uid, error });
        },
      },
    ),
);
