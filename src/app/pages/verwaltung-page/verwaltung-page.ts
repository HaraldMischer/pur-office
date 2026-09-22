// pur-office/src/app/pages/verwaltung-page/verwaltung-page.ts

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { VerwaltungStore } from '../../stores/domain/verwaltung.store';

@Component({
  selector: 'app-verwaltung-page',
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './verwaltung-page.html',
  styleUrl: './verwaltung-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerwaltungPage implements OnInit {
  readonly verwaltungStore = inject(VerwaltungStore);

  /**
   * Lädt beim Öffnen der Seite die für das Benutzerprofil erlaubten Unternehmer.
   */
  ngOnInit(): void {
    void this.verwaltungStore.loadUnternehmer();
  }
}
