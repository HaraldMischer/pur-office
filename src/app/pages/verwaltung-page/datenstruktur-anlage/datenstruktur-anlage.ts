// pur-office/src/app/pages/verwaltung-page/datenstruktur-anlage/datenstruktur-anlage.ts

import { BreakpointObserver } from '@angular/cdk/layout';
import type { StepperOrientation } from '@angular/cdk/stepper';
import { ChangeDetectionStrategy, Component, OnInit, Signal, effect, inject } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { firstValueFrom, map } from 'rxjs';

import { UnternehmerStore } from '../../../stores/domain/unternehmer.store';
import { UnternehmerAnlegenDialog } from './unternehmer-anlegen-dialog/unternehmer-anlegen-dialog';

type TAnlageModus = 'vorhanden' | 'neu';

type TAuswahlForm = {
  modus: FormControl<TAnlageModus>;
  id: FormControl<string>;
  name: FormControl<string>;
};

type TUnternehmerForm = {
  id: FormControl<string>;
};

const nichtLeerValidator = (control: AbstractControl): ValidationErrors | null =>
  String(control.value).trim() ? null : { required: true };

@Component({
  selector: 'app-datenstruktur-anlage',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    ReactiveFormsModule,
  ],
  templateUrl: './datenstruktur-anlage.html',
  styleUrl: './datenstruktur-anlage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatenstrukturAnlage implements OnInit {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly dialog = inject(MatDialog);
  readonly unternehmerStore = inject(UnternehmerStore);

  readonly stepperOrientation: Signal<StepperOrientation> = toSignal(
    this.breakpointObserver
      .observe('(max-width: 720px)')
      .pipe(map((result) => (result.matches ? 'vertical' : 'horizontal'))),
    { initialValue: 'horizontal' },
  );

  readonly unternehmerForm = new FormGroup<TUnternehmerForm>({
    id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly firmaForm = this.createAuswahlForm();
  readonly filialeForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nichtLeerValidator],
    }),
  });

  constructor() {
    this.setupModus(this.firmaForm);
    effect(() => {
      if (this.unternehmerStore.download()) {
        this.unternehmerForm.controls.id.disable({ emitEvent: false });
      } else {
        this.unternehmerForm.controls.id.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    void this.unternehmerStore.loadUnternehmer().catch(() => undefined);
  }

  async openUnternehmerDialog(): Promise<void> {
    this.unternehmerStore.clearError();
    const ergebnis = await firstValueFrom(
      this.dialog
        .open(UnternehmerAnlegenDialog, {
          panelClass: ['pur-dialog__panel', 'pur-dialog__panel--large'],
        })
        .afterClosed(),
    );

    if (ergebnis) {
      this.unternehmerForm.controls.id.setValue(ergebnis.id);
      this.unternehmerForm.controls.id.markAsDirty();
    }
  }

  getUnternehmerBezeichnung(): string {
    const unternehmerId = this.unternehmerForm.controls.id.value;
    return (
      this.unternehmerStore.unternehmer().find((eintrag) => eintrag.id === unternehmerId)?.name ??
      'Kein Unternehmer gewählt'
    );
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
