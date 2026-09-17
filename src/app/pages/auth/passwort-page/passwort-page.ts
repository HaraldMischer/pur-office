// pur-office/src/app/pages/auth/passwort-page/passwort-page.ts

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
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { PasswortStore } from '../../../stores/domain/passwort.store';

type TPasswortForm = {
  aktuellesPasswort: FormControl<string>;
  neuesPasswort: FormControl<string>;
  passwortBestaetigung: FormControl<string>;
};

const passwoerterGleichValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value as {
    neuesPasswort?: string;
    passwortBestaetigung?: string;
  };

  return value.neuesPasswort === value.passwortBestaetigung ? null : { passwoerterUngleich: true };
};

@Component({
  selector: 'app-passwort-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [PasswortStore],
  templateUrl: './passwort-page.html',
  styleUrl: './passwort-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswortPage {
  readonly passwortStore = inject(PasswortStore);
  readonly passwortForm = new FormGroup<TPasswortForm>(
    {
      aktuellesPasswort: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      neuesPasswort: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      passwortBestaetigung: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [passwoerterGleichValidator] },
  );

  async onSubmit(): Promise<void> {
    if (this.passwortForm.invalid || this.passwortStore.inProgress()) {
      this.passwortForm.markAllAsTouched();
      return;
    }

    const value = this.passwortForm.getRawValue();

    try {
      await this.passwortStore.changePassword(value.aktuellesPasswort, value.neuesPasswort);
      this.passwortForm.reset();
    } catch {
      // Der Store stellt die benutzerfreundliche Fehlermeldung bereit.
    }
  }
}
