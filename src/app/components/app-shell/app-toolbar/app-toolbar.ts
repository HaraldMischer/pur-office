// pur-office/src/app/components/app-shell/app-toolbar/app-toolbar.ts

import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';

import { BenutzerStore } from '../../../stores/app/benutzer.store';

@Component({
  selector: 'app-toolbar',
  imports: [MatButtonModule, MatIconModule, MatToolbarModule, RouterLink],
  templateUrl: './app-toolbar.html',
  styleUrl: './app-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppToolbar {
  private readonly _benutzerStore = inject(BenutzerStore);
  private readonly _router = inject(Router);

  readonly sidenavOpened = input(false);
  readonly isAuthenticated = input(false);
  readonly isLoggedIn = input(false);
  readonly inProgress = input(false);
  readonly navigationToggle = output<void>();
  readonly title = 'Pur Office';

  async logout(): Promise<void> {
    await this._benutzerStore.logout();
    await this._router.navigate(['/login']);
  }
}
