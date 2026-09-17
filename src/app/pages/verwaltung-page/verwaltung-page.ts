// pur-office/src/app/pages/verwaltung-page/verwaltung-page.ts

import { ClipboardModule } from '@angular/cdk/clipboard';
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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TAppBereich } from '../../commons/models/app/app-bereich';
import { IBenutzerAnlage, TUserRole, TZugangsart } from '../../commons/models/domain/benutzer';
import { BenutzerVerwaltungStore } from '../../stores/domain/benutzer-verwaltung.store';

type TErlaubteBereicheForm = { [K in TAppBereich]: FormControl<boolean> };
type TZugriffForm = { firmaId: FormControl<string>; filialIds: FormControl<string> };
type TBenutzerAnlageForm = {
  email: FormControl<string>;
  anzeigename: FormControl<string>;
  userRole: FormControl<TUserRole>;
  erlaubteBereiche: FormGroup<TErlaubteBereicheForm>;
  zugriffe: FormArray<FormGroup<TZugriffForm>>;
  zugangsart: FormControl<TZugangsart>;
  passwort: FormControl<string>;
  passwortBestaetigung: FormControl<string>;
};

const zugangValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as {
    zugangsart?: TZugangsart;
    passwort?: string;
    passwortBestaetigung?: string;
  };

  if (value.zugangsart !== 'master-passwort') {
    return null;
  }

  if (!value.passwort || value.passwort.length < 8) {
    return { passwortZuKurz: true };
  }

  return value.passwort === value.passwortBestaetigung ? null : { passwoerterUngleich: true };
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
    ClipboardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  providers: [BenutzerVerwaltungStore],
  templateUrl: './verwaltung-page.html',
  styleUrl: './verwaltung-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerwaltungPage {
  readonly verwaltungStore = inject(BenutzerVerwaltungStore);
  readonly linkKopiert = signal(false);
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
  readonly benutzerForm = new FormGroup<TBenutzerAnlageForm>(
    {
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
      zugangsart: new FormControl<TZugangsart>('einrichtungslink', { nonNullable: true }),
      passwort: new FormControl('', { nonNullable: true }),
      passwortBestaetigung: new FormControl('', { nonNullable: true }),
    },
    { validators: [zugangValidator] },
  );

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
    if (this.verwaltungStore.inProgress()) {
      return;
    }

    const anlage = this.getBenutzerAnlage();
    if (!anlage) {
      return;
    }

    this.linkKopiert.set(false);

    try {
      await this.verwaltungStore.createBenutzer(anlage);
      this.resetForm();
    } catch {
      // Der Store stellt die benutzerfreundliche Fehlermeldung bereit.
    }
  }

  onLinkKopiert(kopiert: boolean): void {
    this.linkKopiert.set(kopiert);
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
      zugangsart: formValue.zugangsart,
      ...(formValue.zugangsart === 'master-passwort' ? { passwort: formValue.passwort } : {}),
    };
  }

  private resetForm(): void {
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
      zugangsart: 'einrichtungslink',
      passwort: '',
      passwortBestaetigung: '',
    });
  }
}
