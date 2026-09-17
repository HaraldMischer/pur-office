// pur-office/src/app/pages/mitarbeiter-page/mitarbeiter-page.spec.ts

import { TestBed } from '@angular/core/testing';

import { MitarbeiterPage } from './mitarbeiter-page';

describe('MitarbeiterPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MitarbeiterPage],
    }).compileComponents();
  });

  it('should create the page', () => {
    const fixture = TestBed.createComponent(MitarbeiterPage);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the page title', () => {
    const fixture = TestBed.createComponent(MitarbeiterPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Mitarbeiter');
  });
});
