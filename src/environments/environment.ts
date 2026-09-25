// pur-office/src/environments/environment.ts

import { firebaseConfig } from './firebase-config';

export const environment = {
  production: false,
  debugLog: true,
  serviceWorkerEnabled: false,
  loginUserRole: null as 'filiale' | 'office' | 'mitarbeiter' | 'master' | null,
  firebase: firebaseConfig,
};
