// pur-office/src/app/pages/systemverwaltung-page/benutzer-page/benutzer-anlage/benutzer-anlage.ts

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { distinctUntilChanged } from 'rxjs';

import { IBenutzerAnlage, TUserRole } from '../../../../commons/models/domain/benutzer';
import {
  buildAnmeldename,
  normalizeNamensbestandteil,
} from '../../../../commons/utils/auth/technische-anmeldeadresse';
import {
  buildErlaubteBereiche,
  getWaehlbareAppBereiche,
  TWaehlbarerAppBereich,
} from '../../../../commons/utils/benutzer/erlaubte-bereiche';
import { BenutzerVerwaltungStore } from '../../../../stores/domain/benutzer-verwaltung.store';
import { DatenzugriffAuswahl } from '../../../../components/datenzugriff-auswahl/datenzugriff-auswahl';

// ===== Top-Level Helper =====================

type TErlaubteBereicheForm = { [K in TWaehlbarerAppBereich]: FormControl<boolean> };
type TBenutzerAnlageForm = {
  namensbestandteil: FormControl<string>;
  anzeigename: FormControl<string>;
  userRole: FormControl<TUserRole>;
  erlaubteBereiche: FormGroup<TErlaubteBereicheForm>;
  passwort: FormControl<string>;
};

function nichtLeerValidator(control: AbstractControl): ValidationErrors | null {
  return String(control.value).trim() ? null : { required: true };
}

function namensbestandteilValidator(control: AbstractControl): ValidationErrors | null {
  return normalizeNamensbestandteil(String(control.value)) ? null : { required: true };
}

@Component({
  selector: 'app-benutzer-anlage',
  imports: [
    DatenzugriffAuswahl,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './benutzer-anlage.html',
  styleUrl: './benutzer-anlage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenutzerAnlage implements OnInit {
  // ===== Interne Dependency Injection =========
  readonly verwaltungStore = inject(BenutzerVerwaltungStore);

  // ===== View Queries =========================
  private readonly formDirective = viewChild.required(FormGroupDirective);

  // ===== Öffentliche Werte ====================
  readonly passwortSichtbar = signal(false);
  readonly rollen: ReadonlyArray<{ value: TUserRole; label: string }> = [
    { value: 'filiale', label: 'Filiale' },
    { value: 'office', label: 'Office' },
    { value: 'mitarbeiter', label: 'Mitarbeiter' },
    { value: 'master', label: 'Master' },
  ];
  readonly bereiche = getWaehlbareAppBereiche();
  readonly benutzerForm = new FormGroup<TBenutzerAnlageForm>({
    namensbestandteil: new FormControl('', {
      nonNullable: true,
      validators: [namensbestandteilValidator],
    }),
    anzeigename: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nichtLeerValidator],
    }),
    userRole: new FormControl<TUserRole>('filiale', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    erlaubteBereiche: new FormGroup<TErlaubteBereicheForm>({
      schichtplan: new FormControl(false, { nonNullable: true }),
      mitarbeiter: new FormControl(false, { nonNullable: true }),
      verwaltung: new FormControl(false, { nonNullable: true }),
    }),
    passwort: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  constructor() {
    this.benutzerForm.controls.anzeigename.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((anzeigename) => {
        this.benutzerForm.controls.namensbestandteil.setValue(
          normalizeNamensbestandteil(anzeigename),
        );
      });
    this.benutzerForm.controls.userRole.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((userRole) => {
        this.verwaltungStore.selectUnternehmer([]);
      });
  }

  // ===== Lifecycle Hooks ======================
  /**
   * Lädt beim Initialisieren die verfügbaren Datenzugriffswerte.
   */
  ngOnInit(): void {
    void this.verwaltungStore.loadAuswahl();
  }

  // ===== Öffentliche Aktionen =================
  /**
   * Validiert und erstellt den Benutzer und setzt das Formular nach erfolgreicher Anlage zurück.
   */
  async onSubmit(): Promise<void> {
    if (this.verwaltungStore.inProgress()) return;

    const anlage = this.getBenutzerAnlage();
    if (!anlage) return;

    try {
      await this.verwaltungStore.createBenutzer(anlage);
      this.resetForm();
    } catch {
      // Der Store stellt die benutzerfreundliche Fehlermeldung bereit.
    }
  }

  /**
   * Prüft die rollenabhängige Datenzugriffsauswahl.
   *
   * @returns `true`, wenn die aktuelle Rolle eine gültige Zuordnung besitzt.
   */
  datenAuswahlGueltig(): boolean {
    const rolle = this.benutzerForm.controls.userRole.value;
    if (rolle === 'master' || rolle === 'mitarbeiter') return true;
    const zugriffe = this.verwaltungStore.zugriffe();
    const firmen = Object.values(zugriffe).flatMap((eintrag) => Object.values(eintrag));
    return (
      this.verwaltungStore.datenAuswahlGueltig() &&
      firmen.length > 0 &&
      (rolle !== 'filiale' ||
        (Object.keys(zugriffe).length === 1 && firmen.length === 1 && firmen[0].length === 1))
    );
  }

  /**
   * Liefert den automatisch gebildeten Anmeldenamen für die Vorschau.
   */
  getAnmeldenameVorschau(): string {
    return buildAnmeldename(
      this.benutzerForm.controls.anzeigename.value,
      this.benutzerForm.controls.userRole.value,
    );
  }

  /**
   * Erstellt aus dem validierten Formular die Daten für die Benutzeranlage.
   *
   * @returns Die Anlagedaten oder `null`, wenn das Formular oder die Datenzugriffsauswahl ungültig ist.
   */
  getBenutzerAnlage(): IBenutzerAnlage | null {
    const namensbestandteilControl = this.benutzerForm.controls.namensbestandteil;
    const anzeigenameControl = this.benutzerForm.controls.anzeigename;
    anzeigenameControl.setValue(anzeigenameControl.getRawValue().trim());
    namensbestandteilControl.setValue(normalizeNamensbestandteil(anzeigenameControl.value));
    this.benutzerForm.updateValueAndValidity();

    if (this.benutzerForm.invalid || !this.datenAuswahlGueltig()) {
      this.benutzerForm.markAllAsTouched();
      return null;
    }

    const formValue = this.benutzerForm.getRawValue();
    const ausgewaehlteBereiche = this.bereiche
      .filter((bereich) => formValue.erlaubteBereiche[bereich.value])
      .map((bereich) => bereich.value);
    const erlaubteBereiche = buildErlaubteBereiche(formValue.userRole, ausgewaehlteBereiche);

    return {
      namensbestandteil: formValue.namensbestandteil,
      anzeigename: formValue.anzeigename,
      userRole: formValue.userRole,
      erlaubteBereiche,
      zugriffe:
        formValue.userRole === 'master' || formValue.userRole === 'mitarbeiter'
          ? {}
          : this.verwaltungStore.zugriffe(),
      passwort: formValue.passwort,
    };
  }

  /**
   * Wechselt die Sichtbarkeit des Passworts.
   */
  togglePasswortSichtbarkeit(): void {
    this.passwortSichtbar.update((sichtbar) => {
      return !sichtbar;
    });
  }

  // ===== Interne Helfer =======================
  private resetForm(): void {
    this.passwortSichtbar.set(false);
    this.verwaltungStore.selectUnternehmer([]);
    this.formDirective().resetForm({
      namensbestandteil: '',
      anzeigename: '',
      userRole: 'filiale',
      erlaubteBereiche: {
        schichtplan: false,
        mitarbeiter: false,
        verwaltung: false,
      },
      passwort: '',
    });
  }
}
