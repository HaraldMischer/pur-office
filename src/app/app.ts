// pur-office/src/app/app.ts

import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Signal, ViewChild, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

import { AppSidenav } from './components/app-shell/app-sidenav/app-sidenav';
import { AppToolbar } from './components/app-shell/app-toolbar/app-toolbar';
import { BenutzerStore } from './stores/app/benutzer.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, AppSidenav, AppToolbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly _breakpointObserver = inject(BreakpointObserver);

  readonly benutzerStore = inject(BenutzerStore);

  @ViewChild(MatSidenav) private readonly _sidenav?: MatSidenav;

  readonly isHandset: Signal<boolean> = toSignal(
    this._breakpointObserver.observe('(max-width: 720px)').pipe(map((result) => result.matches)),
    {
      initialValue: false,
    },
  );

  constructor() {
    this.benutzerStore.initAuthState();
  }

  get isSidenavOpened(): boolean {
    return this._sidenav?.opened ?? false;
  }

  toggleSidenav(): void {
    void this._sidenav?.toggle();
  }

  closeSidenav(): void {
    void this._sidenav?.close();
  }
}
