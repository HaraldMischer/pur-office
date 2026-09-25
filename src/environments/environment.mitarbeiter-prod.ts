// pur-office/src/environments/environment.mitarbeiter-prod.ts

import { firebaseConfig } from './firebase-config';

export const environment = {
  production: true,
  debugLog: false,
  serviceWorkerEnabled: true,
  loginUserRole: 'mitarbeiter' as 'filiale' | 'office' | 'mitarbeiter' | 'master' | null,
  firebase: firebaseConfig,
};
