// pur-office/src/app/pages/systemverwaltung-page/benutzer-verwaltung/benutzer-verwaltung.spec.ts

import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BenutzerVerwaltung } from './benutzer-verwaltung';

describe('BenutzerVerwaltung', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenutzerVerwaltung, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should render the user management dummy', () => {
    const fixture = TestBed.createComponent(BenutzerVerwaltung);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const bearbeitenButton = compiled.querySelector<HTMLButtonElement>('button');

    expect(compiled.querySelector('.pur-page-section__title')?.textContent).toContain(
      'Benutzer verwalten',
    );
    expect(compiled.querySelector('mat-select')).not.toBeNull();
    expect(bearbeitenButton?.textContent).toContain('Benutzer bearbeiten');
    expect(bearbeitenButton?.disabled).toBe(true);
    expect(compiled.querySelector('.pur-form__message')?.textContent).toContain(
      'im nächsten Schritt angebunden',
    );
  });
});
