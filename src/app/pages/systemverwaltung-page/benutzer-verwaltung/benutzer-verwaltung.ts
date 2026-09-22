// pur-office/src/app/pages/systemverwaltung-page/benutzer-verwaltung/benutzer-verwaltung.ts

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-benutzer-verwaltung',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './benutzer-verwaltung.html',
  styleUrl: './benutzer-verwaltung.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenutzerVerwaltung {
  readonly benutzerUid = new FormControl('', { nonNullable: true });
}
