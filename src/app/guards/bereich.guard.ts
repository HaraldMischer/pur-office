// pur-office/src/app/guards/bereich.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom, take } from 'rxjs';

import { TAppBereich } from '../commons/models/app/app-bereich';
import { AuthService } from '../services/firebase/auth.service';
import { BenutzerService } from '../services/firebase/benutzer.service';

export const bereichGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const benutzerService = inject(BenutzerService);
  const router = inject(Router);
  const benutzer = await firstValueFrom(authService.getAuthState().pipe(take(1)));

  if (!benutzer) {
    return router.createUrlTree(['/login']);
  }

  const benutzerProfil = await benutzerService.getBenutzerProfil(benutzer.uid);
  const bereich = route.data['bereich'] as TAppBereich | undefined;

  if (!benutzerProfil?.aktiv) {
    return router.createUrlTree(['/login']);
  }

  if (!bereich || benutzerProfil.erlaubteBereiche.includes(bereich)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
