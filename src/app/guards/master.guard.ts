// pur-office/src/app/guards/master.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom, take } from 'rxjs';

import { AuthService } from '../services/firebase/auth.service';
import { BenutzerService } from '../services/firebase/benutzer.service';

export const masterGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const benutzerService = inject(BenutzerService);
  const router = inject(Router);
  const benutzer = await firstValueFrom(authService.getAuthState().pipe(take(1)));

  if (!benutzer) {
    return router.createUrlTree(['/login']);
  }

  const benutzerProfil = await benutzerService.getBenutzerProfil(benutzer.uid);

  if (!benutzerProfil?.aktiv) {
    return router.createUrlTree(['/login']);
  }

  return benutzerProfil.userRole === 'master' || router.createUrlTree(['/dashboard']);
};
