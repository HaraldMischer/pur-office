// pur-office/src/app/components/app-shell/app-sidenav/app-sidenav.ts

import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TAppBereich } from '../../../commons/models/app/app-bereich';
import { BenutzerStore } from '../../../stores/app/benutzer.store';

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly bereich: TAppBereich;
  readonly masterOnly?: boolean;
}

@Component({
  selector: 'app-sidenav',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './app-sidenav.html',
  styleUrl: './app-sidenav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidenav {
  private readonly _benutzerStore = inject(BenutzerStore);
  readonly benutzerProfil = this._benutzerStore.benutzerProfil;

  readonly isHandset = input(false);
  readonly navigationSelected = output<void>();
  readonly title: Signal<string> = signal('Pur Office');
  readonly navigationItems: Signal<readonly NavigationItem[]> = computed(() =>
    this._navigationItems().filter(
      (item) =>
        this._benutzerStore.darfBereichNutzen(item.bereich) &&
        (!item.masterOnly || this._benutzerStore.istMaster()),
    ),
  );
  private readonly _navigationItems: Signal<readonly NavigationItem[]> = signal([
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      bereich: 'dashboard',
    },
    {
      label: 'Schichtplan',
      icon: 'calendar_month',
      route: '/schichtplan',
      bereich: 'schichtplan',
    },
    {
      label: 'Mitarbeiter',
      icon: 'groups',
      route: '/mitarbeiter',
      bereich: 'mitarbeiter',
    },
    {
      label: 'Verwaltung',
      icon: 'settings',
      route: '/verwaltung',
      bereich: 'verwaltung',
    },
    {
      label: 'Systemverwaltung',
      icon: 'admin_panel_settings',
      route: '/systemverwaltung',
      bereich: 'systemverwaltung',
      masterOnly: true,
    },
  ]);

  closeOnHandset(): void {
    if (!this.isHandset()) {
      return;
    }

    this.navigationSelected.emit();
  }
}
