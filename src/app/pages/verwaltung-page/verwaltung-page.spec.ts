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
              passwortEinrichtungslink: 'https://example.com/reset',
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

    expect(compiled.querySelector('h1')?.textContent).toContain('Verwaltung');
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
      zugangsart: 'einrichtungslink',
    });
  });

  it('should require matching passwords for direct password assignment', () => {
    const fixture = TestBed.createComponent(VerwaltungPage);
    const component = fixture.componentInstance;
    component.benutzerForm.patchValue({
      email: 'user@example.com',
      anzeigename: 'Test Benutzer',
      zugangsart: 'master-passwort',
      passwort: 'SicheresPasswort123!',
      passwortBestaetigung: 'AnderesPasswort123!',
    });

    expect(component.getBenutzerAnlage()).toBeNull();
    expect(component.benutzerForm.hasError('passwoerterUngleich')).toBe(true);
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
