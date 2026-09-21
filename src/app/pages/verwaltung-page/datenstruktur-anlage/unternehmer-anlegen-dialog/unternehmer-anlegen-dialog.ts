// pur-office/src/app/pages/verwaltung-page/datenstruktur-anlage/unternehmer-anlegen-dialog/unternehmer-anlegen-dialog.ts

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  IUnternehmerAnlage,
  IUnternehmerAnlageErgebnis,
} from '../../../../commons/models/domain/unternehmer';
import { UnternehmerStore } from '../../../../stores/domain/unternehmer.store';

const nichtLeerValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  String(control.value).trim() ? null : { required: true };

@Component({
  selector: 'app-unternehmer-anlegen-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './unternehmer-anlegen-dialog.html',
  styleUrl: './unternehmer-anlegen-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnternehmerAnlegenDialog {
  private readonly dialogRef = inject(
    MatDialogRef<UnternehmerAnlegenDialog, IUnternehmerAnlageErgebnis | undefined>,
  );
  readonly unternehmerStore = inject(UnternehmerStore);

  readonly unternehmerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nichtLeerValidator],
    }),
    adresse: new FormGroup({
      strasse: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, nichtLeerValidator],
      }),
      hausnummer: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, nichtLeerValidator],
      }),
      postleitzahl: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, nichtLeerValidator],
      }),
      ort: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, nichtLeerValidator],
      }),
    }),
    kontakt: new FormGroup({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.email],
      }),
      telefon: new FormControl('', { nonNullable: true }),
    }),
  });

  async onSubmit(): Promise<void> {
    const emailControl = this.unternehmerForm.controls.kontakt.controls.email;
    emailControl.setValue(emailControl.getRawValue().trim().toLowerCase());
    this.unternehmerForm.updateValueAndValidity();

    if (this.unternehmerForm.invalid || this.unternehmerStore.inProgress()) {
      this.unternehmerForm.markAllAsTouched();
      return;
    }

    this.dialogRef.disableClose = true;
    try {
      const ergebnis = await this.unternehmerStore.createUnternehmer(this.getUnternehmerAnlage());
      this.dialogRef.close(ergebnis);
    } catch {
      // Der Store stellt die benutzerfreundliche Fehlermeldung bereit.
    } finally {
      this.dialogRef.disableClose = false;
    }
  }

  private getUnternehmerAnlage(): IUnternehmerAnlage {
    const value = this.unternehmerForm.getRawValue();
    const email = value.kontakt.email.trim().toLowerCase();
    const telefon = value.kontakt.telefon.trim();

    return {
      name: value.name.trim(),
      adresse: {
        strasse: value.adresse.strasse.trim(),
        hausnummer: value.adresse.hausnummer.trim(),
        postleitzahl: value.adresse.postleitzahl.trim(),
        ort: value.adresse.ort.trim(),
        land: 'Deutschland',
      },
      kontakt: {
        ...(email ? { email } : {}),
        ...(telefon ? { telefon } : {}),
      },
    };
  }
}
