// pur-office/src/app/pages/verwaltung-page/verwaltung-page.ts

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDivider } from '@angular/material/list';

import { BenutzerVerwaltungStore } from '../../stores/domain/benutzer-verwaltung.store';
import { BenutzerAnlage } from './benutzer-anlage/benutzer-anlage';
import { DatenstrukturAnlage } from './datenstruktur-anlage/datenstruktur-anlage';

@Component({
  selector: 'app-verwaltung-page',
  imports: [BenutzerAnlage, DatenstrukturAnlage, MatDivider],
  providers: [BenutzerVerwaltungStore],
  templateUrl: './verwaltung-page.html',
  styleUrl: './verwaltung-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerwaltungPage {}
