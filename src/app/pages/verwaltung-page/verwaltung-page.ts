// pur-office/src/app/pages/verwaltung-page/verwaltung-page.ts

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DatenzugriffAuswahl } from '../../components/datenzugriff-auswahl/datenzugriff-auswahl';
import { DATENZUGRIFF_MOCK } from './datenzugriff.mock';

import { TAppBereich } from '../../commons/models/app/app-bereich';
import { IBenutzerAnlage, TUserRole } from '../../commons/models/domain/benutzer';
import { BenutzerVerwaltungStore } from '../../stores/domain/benutzer-verwaltung.store';
import { MatDivider } from '@angular/material/list';

type TErlaubteBereicheForm = { [K in TAppBereich]: FormControl<boolean> };
type TZugriffForm = { firmaId: FormControl<string>; filialIds: FormControl<string> };
type TBenutzerAnlageForm = {
  email: FormControl<string>;
  anzeigename: FormControl<string>;
  userRole: FormControl<TUserRole>;
  erlaubteBereiche: FormGroup<TErlaubteBereicheForm>;
  zugriffe: FormArray<FormGroup<TZugriffForm>>;
  passwort: FormControl<string>;
};

const nichtLeerValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  String(control.value).trim() ? null : { required: true };

const mindestensEineFilialeValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null =>
  String(control.value)
    .split(/[\n,;]+/)
    .some((filialId) => filialId.trim())
    ? null
    : { required: true };

const mindestensEinBereichValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const bereiche = control.value as Record<string, boolean>;
  return Object.values(bereiche).some(Boolean) ? null : { mindestensEinBereich: true };
};

@Component({
  selector: 'app-verwaltung-page',
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
    MatDivider,
  ],
  providers: [BenutzerVerwaltungStore],
  templateUrl: './verwaltung-page.html',
  styleUrl: './verwaltung-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerwaltungPage {
  readonly verwaltungStore = inject(BenutzerVerwaltungStore);
  readonly datenzugriffVorschau = true;
  readonly unternehmerVorschau = DATENZUGRIFF_MOCK;
  readonly passwortSichtbar = signal(false);
  readonly rollen: ReadonlyArray<{ value: TUserRole; label: string }> = [
    { value: 'filiale', label: 'Filiale' },
    { value: 'office', label: 'Office' },
    { value: 'master', label: 'Master' },
  ];
  readonly bereiche: ReadonlyArray<{ value: TAppBereich; label: string }> = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'schichtplan', label: 'Schichtplan' },
    { value: 'mitarbeiter', label: 'Mitarbeiter' },
    { value: 'verwaltung', label: 'Verwaltung' },
  ];
  readonly benutzerForm = new FormGroup<TBenutzerAnlageForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    anzeigename: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nichtLeerValidator],
    }),
    userRole: new FormControl<TUserRole>('filiale', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    erlaubteBereiche: new FormGroup<TErlaubteBereicheForm>(
      {
        dashboard: new FormControl(true, { nonNullable: true }),
        schichtplan: new FormControl(false, { nonNullable: true }),
        mitarbeiter: new FormControl(false, { nonNullable: true }),
        verwaltung: new FormControl(false, { nonNullable: true }),
      },
      { validators: [mindestensEinBereichValidator] },
    ),
    zugriffe: new FormArray<FormGroup<TZugriffForm>>([]),
    passwort: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  get zugriffe(): FormArray<FormGroup<TZugriffForm>> {
    return this.benutzerForm.controls.zugriffe;
  }

  addZugriff(): void {
    this.zugriffe.push(
      new FormGroup<TZugriffForm>({
        firmaId: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, nichtLeerValidator],
        }),
        filialIds: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, mindestensEineFilialeValidator],
        }),
      }),
    );
  }

  removeZugriff(index: number): void {
    this.zugriffe.removeAt(index);
  }

  async onSubmit(): Promise<void> {
    if (this.datenzugriffVorschau || this.verwaltungStore.inProgress()) {
      return;
    }

    const anlage = this.getBenutzerAnlage();
    if (!anlage) {
      return;
    }

    try {
      await this.verwaltungStore.createBenutzer(anlage);
      this.resetForm();
    } catch {
      // Der Store stellt die benutzerfreundliche Fehlermeldung bereit.
    }
  }

  getBenutzerAnlage(): IBenutzerAnlage | null {
    const emailControl = this.benutzerForm.controls.email;
    const anzeigenameControl = this.benutzerForm.controls.anzeigename;
    emailControl.setValue(emailControl.getRawValue().trim());
    anzeigenameControl.setValue(anzeigenameControl.getRawValue().trim());
    this.benutzerForm.updateValueAndValidity();

    if (this.benutzerForm.invalid) {
      this.benutzerForm.markAllAsTouched();
      return null;
    }

    const formValue = this.benutzerForm.getRawValue();
    const erlaubteBereiche = this.bereiche
      .filter((bereich) => formValue.erlaubteBereiche[bereich.value])
      .map((bereich) => bereich.value);

    return {
      email: formValue.email,
      anzeigename: formValue.anzeigename,
      userRole: formValue.userRole,
      erlaubteBereiche,
      zugriffe: formValue.zugriffe.map((zugriff) => ({
        firmaId: zugriff.firmaId.trim(),
        filialIds: zugriff.filialIds
          .split(/[\n,;]+/)
          .map((filialId) => filialId.trim())
          .filter(Boolean),
      })),
      passwort: formValue.passwort,
    };
  }

  togglePasswortSichtbarkeit(): void {
    this.passwortSichtbar.update((sichtbar) => !sichtbar);
  }

  private resetForm(): void {
    this.passwortSichtbar.set(false);
    this.zugriffe.clear();
    this.benutzerForm.reset({
      email: '',
      anzeigename: '',
      userRole: 'filiale',
      erlaubteBereiche: {
        dashboard: true,
        schichtplan: false,
        mitarbeiter: false,
        verwaltung: false,
      },
      passwort: '',
    });
  }
}
