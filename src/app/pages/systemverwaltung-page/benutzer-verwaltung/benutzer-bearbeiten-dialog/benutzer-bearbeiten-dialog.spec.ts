// pur-office/src/app/pages/systemverwaltung-page/benutzer-verwaltung/benutzer-bearbeiten-dialog/benutzer-bearbeiten-dialog.spec.ts

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { IBenutzerProfilEintrag } from '../../../../commons/models/domain/benutzer';
import { AuthService } from '../../../../services/firebase/auth.service';
import { StammdatenStore } from '../../../../stores/app/stammdaten.store';
import { BenutzerVerwaltungStore } from '../../../../stores/domain/benutzer-verwaltung.store';
import { BenutzerBearbeitenDialog } from './benutzer-bearbeiten-dialog';

describe('BenutzerBearbeitenDialog', () => {
  const profil: IBenutzerProfilEintrag = {
    uid: 'office-1',
    anmeldename: 'officebenutzer-office',
    email: 'office@example.com',
    anzeigename: 'Office Benutzer',
    aktiv: true,
    userRole: 'office',
    erlaubteBereiche: ['dashboard', 'verwaltung'],
    zugriffe: { u: { f: ['b'] } },
  };
  const aktualisiertesProfil = { ...profil, anzeigename: 'Office Neu' };
  const closeMock = vi.fn();
  const updateBenutzerProfilMock = vi.fn().mockResolvedValue(aktualisiertesProfil);
  const dialogRefMock = { close: closeMock, disableClose: false };
  const verwaltungStoreMock = {
    inProgress: signal(false),
    updateError: signal<string | null>(null),
    updateBenutzerProfil: updateBenutzerProfilMock,
  };
  const stammdatenStoreMock = {
    unternehmer: signal([
      { id: 'u', anzeigename: 'Unternehmer', nummer: 1, aktiv: true, person: {} },
    ]),
    getFirmen: vi.fn().mockReturnValue([
      {
        id: 'f',
        anzeigename: 'Firma',
        firmenname: 'Firma GmbH',
        nummer: 1,
        aktiv: true,
        adresse: {},
        kontakt: {},
      },
    ]),
    getFilialen: vi.fn().mockReturnValue([
      {
        id: 'b',
        anzeigename: 'Filiale',
        filialname: 'Filiale',
        nummer: 1,
        aktiv: true,
        adresse: {},
        kontakt: {},
      },
    ]),
  };
  const authServiceMock = {
    getAktuelleBenutzerId: vi.fn().mockReturnValue('master-1'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    updateBenutzerProfilMock.mockResolvedValue(aktualisiertesProfil);
    dialogRefMock.disableClose = false;
    verwaltungStoreMock.inProgress.set(false);
    verwaltungStoreMock.updateError.set(null);
    authServiceMock.getAktuelleBenutzerId.mockReturnValue('master-1');

    await TestBed.configureTestingModule({
      imports: [BenutzerBearbeitenDialog, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { profil } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: StammdatenStore, useValue: stammdatenStoreMock },
        { provide: BenutzerVerwaltungStore, useValue: verwaltungStoreMock },
      ],
    }).compileComponents();
  });

  it('should initialize editable profile data and preserve login data and role as read-only', () => {
    const fixture = TestBed.createComponent(BenutzerBearbeitenDialog);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const emailInput = fixture.nativeElement.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;
    const anmeldenameInput = fixture.nativeElement.querySelector(
      'input[name="anmeldename"]',
    ) as HTMLInputElement;
    const rollenInput = fixture.nativeElement.querySelector(
      'input[name="benutzerrolle"]',
    ) as HTMLInputElement;

    expect(component.benutzerForm.getRawValue()).toEqual({
      anzeigename: 'Office Benutzer',
      aktiv: true,
      erlaubteBereiche: {
        dashboard: true,
        schichtplan: false,
        mitarbeiter: false,
        verwaltung: true,
        systemverwaltung: false,
      },
    });
    expect(anmeldenameInput.readOnly).toBe(true);
    expect(anmeldenameInput.value).toBe('officebenutzer-office');
    expect(emailInput.readOnly).toBe(true);
    expect(emailInput.value).toBe('office@example.com');
    expect(rollenInput.readOnly).toBe(true);
    expect(rollenInput.value).toBe('Office');
    expect(
      component.benutzerForm.controls.erlaubteBereiche.controls.systemverwaltung.disabled,
    ).toBe(true);
    expect(
      component.benutzerForm.controls.erlaubteBereiche.controls.systemverwaltung.getRawValue(),
    ).toBe(false);
  });

  it('should save normalized profile data and close the dialog', async () => {
    const component = TestBed.createComponent(BenutzerBearbeitenDialog).componentInstance;
    component.benutzerForm.controls.anzeigename.setValue(' Office Neu ');

    await component.onSubmit();

    expect(updateBenutzerProfilMock).toHaveBeenCalledWith({
      anzeigename: 'Office Neu',
      aktiv: true,
      erlaubteBereiche: ['dashboard', 'verwaltung'],
      zugriffe: { u: { f: ['b'] } },
    });
    expect(closeMock).toHaveBeenCalledWith(aktualisiertesProfil);
  });

  it('should disable the active state for the own master profile', async () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, {
      useValue: {
        profil: {
          ...profil,
          uid: 'master-1',
          userRole: 'master',
          erlaubteBereiche: ['dashboard'],
          zugriffe: {},
        },
      },
    });
    const component = TestBed.createComponent(BenutzerBearbeitenDialog).componentInstance;

    expect(component.istEigenesProfil).toBe(true);
    expect(component.benutzerForm.controls.aktiv.disabled).toBe(true);
    expect(
      component.benutzerForm.controls.erlaubteBereiche.controls.systemverwaltung.disabled,
    ).toBe(true);
    expect(
      component.benutzerForm.controls.erlaubteBereiche.controls.systemverwaltung.getRawValue(),
    ).toBe(true);
  });

  it('should update selected employee account areas while keeping data scopes empty', async () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, {
      useValue: {
        profil: {
          ...profil,
          uid: 'mitarbeiter-1',
          userRole: 'mitarbeiter',
          erlaubteBereiche: ['dashboard'],
          zugriffe: { u: { f: ['b'] } },
        },
      },
    });
    const fixture = TestBed.createComponent(BenutzerBearbeitenDialog);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const rollenInput = fixture.nativeElement.querySelector(
      'input[name="benutzerrolle"]',
    ) as HTMLInputElement;

    expect(rollenInput.value).toBe('Mitarbeiter');
    expect(component.benutzerForm.controls.erlaubteBereiche.getRawValue()).toEqual({
      dashboard: true,
      schichtplan: false,
      mitarbeiter: false,
      verwaltung: false,
      systemverwaltung: false,
    });
    expect(component.benutzerForm.controls.erlaubteBereiche.controls.dashboard.enabled).toBe(true);
    expect(component.benutzerForm.controls.erlaubteBereiche.controls.schichtplan.enabled).toBe(
      true,
    );
    expect(fixture.nativeElement.querySelector('app-datenzugriff-auswahl')).toBeNull();

    component.benutzerForm.controls.anzeigename.setValue('Mitarbeiter Neu');
    component.benutzerForm.controls.erlaubteBereiche.patchValue({
      dashboard: false,
      schichtplan: true,
      mitarbeiter: true,
    });
    await component.onSubmit();

    expect(updateBenutzerProfilMock).toHaveBeenCalledWith({
      anzeigename: 'Mitarbeiter Neu',
      aktiv: true,
      erlaubteBereiche: ['schichtplan', 'mitarbeiter'],
      zugriffe: {},
    });
  });
});
