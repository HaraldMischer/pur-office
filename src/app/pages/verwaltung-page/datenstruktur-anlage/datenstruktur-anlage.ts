// pur-office/src/app/pages/verwaltung-page/datenstruktur-anlage/datenstruktur-anlage.ts

import { BreakpointObserver } from '@angular/cdk/layout';
import type { StepperOrientation } from '@angular/cdk/stepper';
import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { map } from 'rxjs';

type TAnlageModus = 'vorhanden' | 'neu';

type TAuswahlForm = {
  modus: FormControl<TAnlageModus>;
  id: FormControl<string>;
  name: FormControl<string>;
};

const nichtLeerValidator = (control: AbstractControl): ValidationErrors | null =>
  String(control.value).trim() ? null : { required: true };

@Component({
  selector: 'app-datenstruktur-anlage',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    ReactiveFormsModule,
  ],
  templateUrl: './datenstruktur-anlage.html',
  styleUrl: './datenstruktur-anlage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatenstrukturAnlage {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly stepperOrientation: Signal<StepperOrientation> = toSignal(
    this.breakpointObserver
      .observe('(max-width: 720px)')
      .pipe(map((result) => (result.matches ? 'vertical' : 'horizontal'))),
    { initialValue: 'horizontal' },
  );

  readonly unternehmerForm = this.createAuswahlForm();
  readonly firmaForm = this.createAuswahlForm();
  readonly filialeForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nichtLeerValidator],
    }),
  });

  constructor() {
    this.setupModus(this.unternehmerForm);
    this.setupModus(this.firmaForm);
  }

  getUnternehmerBezeichnung(): string {
    return this.getAuswahlBezeichnung(this.unternehmerForm, 'Kein Unternehmer gewählt');
  }

  getFirmaBezeichnung(): string {
    return this.getAuswahlBezeichnung(this.firmaForm, 'Keine Firma gewählt');
  }

  private createAuswahlForm(): FormGroup<TAuswahlForm> {
    return new FormGroup<TAuswahlForm>({
      modus: new FormControl<TAnlageModus>('neu', { nonNullable: true }),
      id: new FormControl('', { nonNullable: true }),
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, nichtLeerValidator],
      }),
    });
  }

  private setupModus(form: FormGroup<TAuswahlForm>): void {
    form.controls.modus.valueChanges.subscribe((modus) => {
      const id = form.controls.id;
      const name = form.controls.name;

      id.setValidators(modus === 'vorhanden' ? [Validators.required] : []);
      name.setValidators(modus === 'neu' ? [Validators.required, nichtLeerValidator] : []);
      id.updateValueAndValidity();
      name.updateValueAndValidity();
    });
  }

  private getAuswahlBezeichnung(form: FormGroup<TAuswahlForm>, fallback: string): string {
    const value = form.getRawValue();
    const bezeichnung = value.modus === 'neu' ? value.name : value.id;
    return bezeichnung.trim() || fallback;
  }
}
