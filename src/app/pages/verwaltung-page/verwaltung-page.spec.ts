// pur-office/src/app/pages/verwaltung-page/verwaltung-page.spec.ts

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormGroupDirective } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DatenzugriffAuswahl } from '../../components/datenzugriff-auswahl/datenzugriff-auswahl';
import { TestBed } from '@angular/core/testing';

import { DatenzugriffService } from '../../services/firebase/datenzugriff.service';
import { BenutzerVerwaltungService } from '../../services/firebase/benutzer-verwaltung.service';
import { BenutzerVerwaltungStore } from '../../stores/domain/benutzer-verwaltung.store';
import { BenutzerAnlage } from './benutzer-anlage/benutzer-anlage';
import { VerwaltungPage } from './verwaltung-page';

describe('VerwaltungPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenutzerAnlage, VerwaltungPage, NoopAnimationsModule],
      providers: [
        BenutzerVerwaltungStore,
        {
          provide: DatenzugriffService,
          useValue: {
            loadUnternehmer: vi.fn().mockResolvedValue([]),
            loadFirmen: vi.fn().mockResolvedValue([]),
            loadFilialen: vi.fn().mockResolvedValue([]),
          },
        },
        {
          provide: BenutzerVerwaltungService,
          useValue: {
            createBenutzer: vi.fn().mockResolvedValue({
              uid: 'neu-123',
              email: 'user.com',
            }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the page with an invalid empty user form', () => {
    const fixture = TestBed.createComponent(BenutzerAnlage);

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.benutzerForm.invalid).toBe(true);
  });

  it('should render role and area controls', () => {
    const fixture = TestBed.createComponent(VerwaltungPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Verwaltung');
    expect(
      Array.from(compiled.querySelectorAll('.pur-page-section__title')).map((titel) =>
        titel.textContent?.trim(),
      ),
    ).toEqual(['Datenstruktur anlegen', 'Benutzer anlegen']);
    expect(compiled.querySelectorAll('mat-step-header')).toHaveLength(3);
    expect(compiled.querySelector('mat-stepper')?.textContent).toContain('Unternehmer');
    expect(compiled.querySelector('mat-stepper')?.textContent).toContain('Firma');
    expect(compiled.querySelector('mat-stepper')?.textContent).toContain('Filiale');
    expect(compiled.querySelectorAll('mat-divider')).toHaveLength(1);
    expect(compiled.querySelector('mat-select')).toBeTruthy();
    expect(compiled.querySelectorAll('mat-checkbox')).toHaveLength(4);
  });

  it('should create normalized input data from a valid form', () => {
    const fixture = TestBed.createComponent(BenutzerAnlage);
    const component = fixture.componentInstance;
    component.benutzerForm.patchValue({
      email: '  user@example.com ',
      anzeigename: '  Test Benutzer ',
      userRole: 'master',
      passwort: 'SicheresPasswort123!',
      erlaubteBereiche: {
        dashboard: true,
        schichtplan: true,
        mitarbeiter: false,
        verwaltung: false,
      },
    });
    expect(component.getBenutzerAnlage()).toEqual({
      email: 'user@example.com',
      anzeigename: 'Test Benutzer',
      userRole: 'master',
      erlaubteBereiche: ['dashboard', 'schichtplan'],
      zugriffe: {},
      passwort: 'SicheresPasswort123!',
    });
  });

  it.each(['', 'short'])(
    'should prevent submission with an invalid initial password: %s',
    async (passwort) => {
      const component = TestBed.createComponent(BenutzerAnlage).componentInstance;
      component.benutzerForm.patchValue({
        email: 'user@example.com',
        anzeigename: 'Test',
        passwort,
      });
      await component.onSubmit();
      expect(component.getBenutzerAnlage()).toBeNull();
      expect(TestBed.inject(BenutzerVerwaltungService).createBenutzer).not.toHaveBeenCalled();
    },
  );

  it('should enable submission for valid input and clear the form after success', async () => {
    const fixture = TestBed.createComponent(BenutzerAnlage);
    const component = fixture.componentInstance;
    component.benutzerForm.patchValue({
      email: 'user@example.com',
      anzeigename: 'Test',
      userRole: 'master',
      passwort: 'SicheresPasswort123!',
    });
    expect(component.benutzerForm.valid).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
    const directive = fixture.debugElement
      .query(By.directive(FormGroupDirective))
      .injector.get(FormGroupDirective);
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(directive.submitted).toBe(true);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(directive.submitted).toBe(false);
    expect(component.benutzerForm.pristine).toBe(true);
    expect(component.benutzerForm.untouched).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('mat-error')).toHaveLength(0);
    expect(fixture.nativeElement.querySelectorAll('.mat-mdc-form-field-invalid')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.pur-form__success')).not.toBeNull();
    expect(
      TestBed.inject(BenutzerVerwaltungService).createBenutzer,
    ).toHaveBeenCalledExactlyOnceWith({
      email: 'user@example.com',
      anzeigename: 'Test',
      userRole: 'master',
      passwort: 'SicheresPasswort123!',
      erlaubteBereiche: ['dashboard'],
      zugriffe: {},
    });
    expect(component.benutzerForm.controls.passwort.value).toBe('');
    expect(component.benutzerForm.controls.email.value).toBe('');
  });

  it('should toggle password visibility without submitting or changing the password', () => {
    const fixture = TestBed.createComponent(BenutzerAnlage);
    const component = fixture.componentInstance;
    component.benutzerForm.patchValue({
      email: 'user@example.com',
      anzeigename: 'Test',
      passwort: 'SicheresPasswort123!',
    });
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input[formControlName="passwort"]',
    ) as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('button[matSuffix]') as HTMLButtonElement;
    expect(input.type).toBe('password');
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Passwort anzeigen');
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(button.getAttribute('aria-label')).toBe('Passwort ausblenden');
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('password');
    expect(input.value).toBe('SicheresPasswort123!');
    expect(TestBed.inject(BenutzerVerwaltungService).createBenutzer).not.toHaveBeenCalled();
  });

  it('should show the area error immediately when the last checkbox is unchecked without blur', async () => {
    const fixture = TestBed.createComponent(BenutzerAnlage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const gruppe = fixture.nativeElement.querySelector(
      '[formGroupName="erlaubteBereiche"]',
    ) as HTMLElement;
    const dashboard = gruppe.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const bereiche = fixture.componentInstance.benutzerForm.controls.erlaubteBereiche;
    expect(dashboard.checked).toBe(true);
    expect(gruppe.querySelector('[role="alert"]')).toBeNull();

    dashboard.focus();
    dashboard.click();
    fixture.detectChanges();
    expect(bereiche.touched).toBe(false);
    expect(bereiche.dirty).toBe(true);
    expect(gruppe.querySelector('[role="alert"]')?.textContent).toContain(
      'Mindestens ein Bereich ist erforderlich.',
    );

    dashboard.click();
    fixture.detectChanges();
    expect(gruppe.querySelector('[role="alert"]')).toBeNull();
  });

  it('should require at least one allowed area', () => {
    const fixture = TestBed.createComponent(BenutzerAnlage);
    const component = fixture.componentInstance;
    component.benutzerForm.patchValue({
      email: 'user@example.com',
      anzeigename: 'Test Benutzer',
      erlaubteBereiche: {
        dashboard: false,
        schichtplan: false,
        mitarbeiter: false,
        verwaltung: false,
      },
    });

    expect(component.getBenutzerAnlage()).toBeNull();
    expect(component.benutzerForm.controls.erlaubteBereiche.hasError('mindestensEinBereich')).toBe(
      true,
    );
  });
  it('should submit the selected hierarchy only after the selection is complete', async () => {
    const daten = TestBed.inject(DatenzugriffService);
    vi.mocked(daten.loadUnternehmer).mockResolvedValue([{ id: 'u', name: 'Unternehmer' }]);
    vi.mocked(daten.loadFirmen).mockResolvedValue([{ id: 'f', name: 'Firma' }]);
    vi.mocked(daten.loadFilialen).mockResolvedValue([{ id: 'b', name: 'Filiale' }]);
    const fixture = TestBed.createComponent(BenutzerAnlage);
    async function render() {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    }
    await render();
    fixture.componentInstance.benutzerForm.patchValue({
      email: 'user@example.com',
      anzeigename: 'Test',
      passwort: 'SicheresPasswort123!',
    });
    const component = fixture.debugElement.query(By.directive(DatenzugriffAuswahl))
      .componentInstance as DatenzugriffAuswahl;
    expect(component.unternehmer().map((u) => u.id)).toEqual(['u']);
    component.selectUnternehmer('u');
    await render();
    expect(fixture.componentInstance.getBenutzerAnlage()).toBeNull();
    await fixture.componentInstance.onSubmit();
    expect(TestBed.inject(BenutzerVerwaltungService).createBenutzer).not.toHaveBeenCalled();
    const key = component.getFirmaSchluessel('u', 'f');
    expect(component.firmen().map((f) => f.id)).toEqual([key]);
    component.selectFirmen([key]);
    await render();
    expect(fixture.componentInstance.getBenutzerAnlage()).toBeNull();
    await fixture.componentInstance.onSubmit();
    expect(TestBed.inject(BenutzerVerwaltungService).createBenutzer).not.toHaveBeenCalled();
    component.selectFiliale(key, 'b', true);
    await render();
    expect(fixture.componentInstance.verwaltungStore.filialen()).toEqual({ [key]: ['b'] });
    const auswahl = fixture.nativeElement.querySelector('app-datenzugriff-auswahl') as HTMLElement;
    expect(auswahl.closest('.pur-form__group')).not.toBeNull();
    expect(auswahl.closest('fieldset')).toBeNull();
    expect(auswahl.querySelectorAll('mat-select')).toHaveLength(3);
    expect(fixture.componentInstance.getBenutzerAnlage()?.zugriffe).toEqual({
      u: { f: ['b'] },
    });
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
    await fixture.componentInstance.onSubmit();
    expect(TestBed.inject(BenutzerVerwaltungService).createBenutzer).toHaveBeenCalledWith(
      expect.objectContaining({
        zugriffe: { u: { f: ['b'] } },
      }),
    );
  });
  it('blocks duplicate submissions while saving and preserves input on failure', async () => {
    const fixture = TestBed.createComponent(BenutzerAnlage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.benutzerForm.patchValue({
      email: 'user@example.com',
      anzeigename: 'Test',
      userRole: 'master',
      passwort: 'SicheresPasswort123!',
    });
    const service = TestBed.inject(BenutzerVerwaltungService);
    let rejectSave!: (error: Error) => void;
    vi.mocked(service.createBenutzer).mockReturnValue(
      new Promise((_, reject) => {
        rejectSave = reject;
      }),
    );
    const pending = component.onSubmit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    await component.onSubmit();
    expect(service.createBenutzer).toHaveBeenCalledTimes(1);
    rejectSave(new Error('Speichern fehlgeschlagen'));
    await pending;
    fixture.detectChanges();
    expect(component.benutzerForm.controls.email.value).toBe('user@example.com');
    expect(component.verwaltungStore.error()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
  });
  it.each(['office', 'filiale'] as const)(
    'keeps %s disabled without any data selection, including after a role change',
    async (userRole) => {
      const fixture = TestBed.createComponent(BenutzerAnlage);
      fixture.detectChanges();
      await fixture.whenStable();
      const component = fixture.componentInstance;
      component.benutzerForm.patchValue({
        email: 'user@example.com',
        anzeigename: 'Test',
        passwort: 'SicheresPasswort123!',
        userRole,
      });
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.disabled).toBe(true);
      await component.onSubmit();
      expect(TestBed.inject(BenutzerVerwaltungService).createBenutzer).not.toHaveBeenCalled();
      component.benutzerForm.controls.userRole.setValue('master');
      fixture.detectChanges();
      expect(button.disabled).toBe(false);
      component.benutzerForm.controls.userRole.setValue(userRole);
      fixture.detectChanges();
      expect(button.disabled).toBe(true);
    },
  );
  it('recreates fixed selection modes and clears assignments when changing roles', async () => {
    const daten = TestBed.inject(DatenzugriffService);
    vi.mocked(daten.loadUnternehmer).mockResolvedValue([{ id: 'u', name: 'Unternehmer' }]);
    vi.mocked(daten.loadFirmen).mockResolvedValue([{ id: 'f', name: 'Firma' }]);
    vi.mocked(daten.loadFilialen).mockResolvedValue([
      { id: 'b1', name: 'Filiale 1' },
      { id: 'b2', name: 'Filiale 2' },
    ]);
    const fixture = TestBed.createComponent(BenutzerAnlage);
    const page = fixture.componentInstance;
    async function render() {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    }
    await render();
    const initial = fixture.debugElement.query(By.directive(DatenzugriffAuswahl))
      .componentInstance as DatenzugriffAuswahl;
    expect(initial.unternehmerMehrfach()).toBe(false);
    expect(initial.firmenMehrfach()).toBe(false);
    expect(initial.filialenMehrfach()).toBe(false);
    page.benutzerForm.controls.userRole.setValue('office');
    await render();
    const office = fixture.debugElement.query(By.directive(DatenzugriffAuswahl))
      .componentInstance as DatenzugriffAuswahl;
    expect(office).not.toBe(initial);
    expect(office.unternehmerMehrfach()).toBe(false);
    expect(office.firmenMehrfach()).toBe(true);
    expect(office.filialenMehrfach()).toBe(true);
    office.selectUnternehmer('u');
    await render();
    const key = office.getFirmaSchluessel('u', 'f');
    office.selectFirmen([key]);
    await render();
    office.selectFiliale(key, 'b1', true);
    office.selectFiliale(key, 'b2', true);
    await render();
    expect(page.verwaltungStore.zugriffe()['u']['f']).toHaveLength(2);
    expect(page.datenAuswahlGueltig()).toBe(true);
    page.benutzerForm.controls.userRole.setValue('filiale');
    await render();
    expect(page.verwaltungStore.unternehmerIds()).toEqual([]);
    expect(page.verwaltungStore.zugriffe()).toEqual({});
    const branch = fixture.debugElement.query(By.directive(DatenzugriffAuswahl))
      .componentInstance as DatenzugriffAuswahl;
    expect(branch).not.toBe(office);
    expect(branch.filialenMehrfach()).toBe(false);
    expect(page.datenAuswahlGueltig()).toBe(false);
    // Auch die Seitenvalidierung weist eine manipulierte Mehrfachzuordnung ab.
    page.verwaltungStore.selectUnternehmer(['u']);
    await render();
    page.verwaltungStore.selectFirmen([key]);
    await render();
    page.verwaltungStore.selectFilialen({ [key]: ['b1', 'b2'] });
    expect(page.datenAuswahlGueltig()).toBe(false);
    page.benutzerForm.controls.userRole.setValue('master');
    await render();
    expect(fixture.debugElement.query(By.directive(DatenzugriffAuswahl))).toBeNull();
    expect(page.verwaltungStore.zugriffe()).toEqual({});
    expect(page.datenAuswahlGueltig()).toBe(true);
  });
});
