// pur-office/src/app/pages/verwaltung-page/datenstruktur-anlage/datenstruktur-anlage.spec.ts

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatStepper } from '@angular/material/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { DatenstrukturAnlage } from './datenstruktur-anlage';

describe('DatenstrukturAnlage', () => {
  const breakpointState = new BehaviorSubject<BreakpointState>({
    matches: false,
    breakpoints: {},
  });

  beforeEach(async () => {
    breakpointState.next({ matches: false, breakpoints: {} });
    await TestBed.configureTestingModule({
      imports: [DatenstrukturAnlage, NoopAnimationsModule],
      providers: [
        {
          provide: BreakpointObserver,
          useValue: { observe: vi.fn(() => breakpointState.asObservable()) },
        },
      ],
    }).compileComponents();
  });

  it('should render three linear steps without a connected save action', () => {
    const fixture = TestBed.createComponent(DatenstrukturAnlage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const stepper = fixture.debugElement.query(By.directive(MatStepper))
      .componentInstance as MatStepper;
    const anlegenButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Datenstruktur anlegen'),
    );

    expect(stepper.linear).toBe(true);
    expect(compiled.querySelectorAll('mat-step-header')).toHaveLength(3);
    expect(anlegenButton?.disabled).toBe(true);
    expect(compiled.textContent).toContain(
      'Das Speichern in Firestore wird in einem späteren Schritt angebunden.',
    );
  });

  it('should validate new and existing entrepreneur input according to the selected mode', () => {
    const component = TestBed.createComponent(DatenstrukturAnlage).componentInstance;

    expect(component.unternehmerForm.invalid).toBe(true);
    component.unternehmerForm.controls.name.setValue('Unternehmer Nord');
    expect(component.unternehmerForm.valid).toBe(true);

    component.unternehmerForm.controls.modus.setValue('vorhanden');
    expect(component.unternehmerForm.controls.name.valid).toBe(true);
    expect(component.unternehmerForm.controls.id.hasError('required')).toBe(true);

    component.unternehmerForm.controls.id.setValue('unternehmer-1');
    expect(component.unternehmerForm.valid).toBe(true);
  });

  it('should move forward only after valid input and show the selected hierarchy', async () => {
    const fixture = TestBed.createComponent(DatenstrukturAnlage);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const stepper = fixture.debugElement.query(By.directive(MatStepper))
      .componentInstance as MatStepper;
    const next = () =>
      fixture.nativeElement.querySelector('button[matStepperNext]') as HTMLButtonElement;

    expect(next().disabled).toBe(true);
    component.unternehmerForm.controls.name.setValue('Unternehmer Nord');
    fixture.detectChanges();
    expect(next().disabled).toBe(false);
    next().click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(stepper.selectedIndex).toBe(1);

    component.firmaForm.controls.name.setValue('Firma Nord');
    fixture.detectChanges();
    next().click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(stepper.selectedIndex).toBe(2);

    component.filialeForm.controls.name.setValue('Filiale Hamburg');
    fixture.detectChanges();
    const zusammenfassung = fixture.nativeElement.querySelector(
      '.datenstruktur-zusammenfassung',
    ) as HTMLElement;
    expect(zusammenfassung.textContent).toContain('Unternehmer Nord');
    expect(zusammenfassung.textContent).toContain('Firma Nord');
    expect(zusammenfassung.textContent).toContain('Filiale Hamburg');
  });

  it('should use vertical orientation on small screens', () => {
    const fixture = TestBed.createComponent(DatenstrukturAnlage);
    fixture.detectChanges();
    expect(fixture.componentInstance.stepperOrientation()).toBe('horizontal');

    breakpointState.next({ matches: true, breakpoints: {} });
    fixture.detectChanges();
    expect(fixture.componentInstance.stepperOrientation()).toBe('vertical');
  });
});
