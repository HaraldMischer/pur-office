// pur-office/src/app/pages/verwaltung-page/verwaltung-page.spec.ts

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';

import { BenutzerVerwaltungService } from '../../services/firebase/benutzer-verwaltung.service';
import { VerwaltungPage } from './verwaltung-page';

describe('VerwaltungPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerwaltungPage, NoopAnimationsModule],
      providers: [
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
    const fixture = TestBed.createComponent(VerwaltungPage);

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.benutzerForm.invalid).toBe(true);
  });

  it('should render role and area controls', () => {
    const fixture = TestBed.createComponent(VerwaltungPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Benutzer anlegen');
    expect(compiled.querySelector('mat-select')).toBeTruthy();
    expect(compiled.querySelectorAll('mat-checkbox')).toHaveLength(4);
  });

  it('should add and remove company access controls', () => {
    const fixture = TestBed.createComponent(VerwaltungPage);
    const component = fixture.componentInstance;

    component.addZugriff();

    expect(component.zugriffe).toHaveLength(1);

    component.removeZugriff(0);

    expect(component.zugriffe).toHaveLength(0);
  });

  it('should create normalized input data from a valid form', () => {
    const fixture = TestBed.createComponent(VerwaltungPage);
    const component = fixture.componentInstance;
    component.benutzerForm.patchValue({
      email: '  user@example.com ',
      anzeigename: '  Test Benutzer ',
      userRole: 'office',
      passwort: 'SicheresPasswort123!',
      erlaubteBereiche: {
        dashboard: true,
        schichtplan: true,
        mitarbeiter: false,
        verwaltung: false,
      },
    });
    component.addZugriff();
    component.zugriffe.at(0).setValue({
      firmaId: ' firma-1 ',
      filialIds: 'filiale-1, filiale-2; filiale-3',
    });

    expect(component.getBenutzerAnlage()).toEqual({
      email: 'user@example.com',
      anzeigename: 'Test Benutzer',
      userRole: 'office',
      erlaubteBereiche: ['dashboard', 'schichtplan'],
      zugriffe: [
        {
          firmaId: 'firma-1',
          filialIds: ['filiale-1', 'filiale-2', 'filiale-3'],
        },
      ],
      passwort: 'SicheresPasswort123!',
    });
  });

  it.each(['', 'short'])(
    'should prevent submission with an invalid initial password: %s',
    async (passwort) => {
      const component = TestBed.createComponent(VerwaltungPage).componentInstance;
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

  it('should block user creation during preview even with valid input', async () => {
    const fixture = TestBed.createComponent(VerwaltungPage);
    const component = fixture.componentInstance;
    component.benutzerForm.patchValue({
      email: 'user@example.com',
      anzeigename: 'Test',
      passwort: 'SicheresPasswort123!',
    });
    expect(component.benutzerForm.valid).toBe(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    await component.onSubmit();
    expect(TestBed.inject(BenutzerVerwaltungService).createBenutzer).not.toHaveBeenCalled();
  });

  it('should toggle password visibility without submitting or changing the password', () => {
    const fixture = TestBed.createComponent(VerwaltungPage);
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

  it('should reject access controls without company and branch identifiers', () => {
    const fixture = TestBed.createComponent(VerwaltungPage);
    const component = fixture.componentInstance;
    component.benutzerForm.patchValue({
      email: 'user@example.com',
      anzeigename: 'Test Benutzer',
    });
    component.addZugriff();
    component.zugriffe.at(0).setValue({
      firmaId: '   ',
      filialIds: ' , ; ',
    });

    expect(component.getBenutzerAnlage()).toBeNull();
    expect(component.zugriffe.at(0).controls.firmaId.hasError('required')).toBe(true);
    expect(component.zugriffe.at(0).controls.filialIds.hasError('required')).toBe(true);
  });

  it('should require at least one allowed area', () => {
    const fixture = TestBed.createComponent(VerwaltungPage);
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
});
