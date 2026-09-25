// pur-office/src/environments/environment.mitarbeiter-prod.ts

import { firebaseConfig } from './firebase-config';

export const environment = {
  production: true,
  debugLog: false,
  serviceWorkerEnabled: true,
  firebase: firebaseConfig,
};
