// pur-office/src/app/pages/systemverwaltung-page/systemverwaltung-page.ts

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDivider } from '@angular/material/list';

import { BenutzerAnlage } from './benutzer-anlage/benutzer-anlage';
import { BenutzerVerwaltung } from './benutzer-verwaltung/benutzer-verwaltung';
import { DatenstrukturAnlage } from './datenstruktur-anlage/datenstruktur-anlage';

@Component({
  selector: 'app-systemverwaltung-page',
  imports: [BenutzerAnlage, BenutzerVerwaltung, DatenstrukturAnlage, MatDivider],
  templateUrl: './systemverwaltung-page.html',
  styleUrl: './systemverwaltung-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemverwaltungPage {}
