// pur-office/src/app/pages/auth/login-page/login-page.ts

import { ChangeDetectionStrategy, Component, effect, inject, isDevMode } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { BenutzerStore } from '../../../stores/app/benutzer.store';

type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly _benutzerStore = inject(BenutzerStore);
  private readonly _router = inject(Router);

  readonly inProgress = this._benutzerStore.inProgress;
  readonly error = this._benutzerStore.error;
  readonly isDevelopmentMode = isDevMode();
  readonly loginForm = new FormGroup<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      if (this._benutzerStore.darfBereichNutzen('dashboard')) {
        void this._router.navigate(['/dashboard']);
      }
    });
  }

  async submitLogin(): Promise<void> {
    const emailControl = this.loginForm.controls.email;
    const normalisierteEmail = emailControl.getRawValue().trim();
    emailControl.setValue(normalisierteEmail);
    emailControl.updateValueAndValidity();

    if (this.loginForm.invalid || this.inProgress()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { password } = this.loginForm.getRawValue();
    await this._benutzerStore.login(normalisierteEmail, password);
    await this._router.navigate(['/dashboard']);
  }

  patchLoginForm(): void {
    this.loginForm.patchValue({
      email: 'harry-master@pur-system.de',
      password: '',
    });
  }
}
