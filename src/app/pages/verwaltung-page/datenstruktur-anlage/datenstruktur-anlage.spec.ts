// pur-office/src/app/pages/verwaltung-page/datenstruktur-anlage/datenstruktur-anlage.spec.ts

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { signal, WritableSignal } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { UnternehmerStore } from '../../../stores/domain/unternehmer.store';
import { DatenstrukturAnlage } from './datenstruktur-anlage';
import { UnternehmerAnlegenDialog } from './unternehmer-anlegen-dialog/unternehmer-anlegen-dialog';

describe('DatenstrukturAnlage', () => {
  const breakpointState = new BehaviorSubject<BreakpointState>({
    matches: false,
    breakpoints: {},
  });
  let dialogOpenMock: ReturnType<typeof vi.fn>;
  let unternehmerStoreMock: {
    unternehmer: WritableSignal<readonly { id: string; name: string; nummer: number }[]>;
    download: WritableSignal<boolean>;
    isLoaded: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    loadUnternehmer: ReturnType<typeof vi.fn>;
    clearError: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    breakpointState.next({ matches: false, breakpoints: {} });
    dialogOpenMock = vi.fn().mockReturnValue({ afterClosed: () => of(undefined) });
    unternehmerStoreMock = {
      unternehmer: signal([{ id: 'unternehmer-1', name: 'Unternehmer Nord', nummer: 1 }]),
      download: signal(false),
      isLoaded: signal(true),
      error: signal(null),
      loadUnternehmer: vi.fn().mockResolvedValue(undefined),
      clearError: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [DatenstrukturAnlage, NoopAnimationsModule],
      providers: [
        {
          provide: BreakpointObserver,
          useValue: { observe: vi.fn(() => breakpointState.asObservable()) },
        },
        { provide: MatDialog, useValue: { open: dialogOpenMock } },
        { provide: UnternehmerStore, useValue: unternehmerStoreMock },
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

  it('should require an existing entrepreneur selection', () => {
    const component = TestBed.createComponent(DatenstrukturAnlage).componentInstance;

    expect(component.unternehmerForm.invalid).toBe(true);
    expect(component.unternehmerForm.controls.id.hasError('required')).toBe(true);

    component.unternehmerForm.controls.id.setValue('unternehmer-1');
    expect(component.unternehmerForm.valid).toBe(true);
  });

  it('should enable entrepreneur creation only after the list was loaded', () => {
    unternehmerStoreMock.isLoaded.set(false);
    const fixture = TestBed.createComponent(DatenstrukturAnlage);
    fixture.detectChanges();
    const getAnlegenButton = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
      ).find((button) => button.textContent?.includes('Unternehmer anlegen'));

    expect(getAnlegenButton()?.disabled).toBe(true);

    unternehmerStoreMock.isLoaded.set(true);
    fixture.detectChanges();

    expect(getAnlegenButton()?.disabled).toBe(false);
  });

  it('should open the entrepreneur dialog and select the created entrepreneur', async () => {
    dialogOpenMock.mockReturnValue({
      afterClosed: () =>
        of({
          id: 'unternehmer-neu',
          nummer: 2,
          name: 'Unternehmer Neu',
        }),
    });
    const component = TestBed.createComponent(DatenstrukturAnlage).componentInstance;

    await component.openUnternehmerDialog();

    expect(unternehmerStoreMock.clearError).toHaveBeenCalled();
    expect(dialogOpenMock).toHaveBeenCalledWith(UnternehmerAnlegenDialog, {
      panelClass: ['pur-dialog__panel', 'pur-dialog__panel--large'],
    });
    expect(component.unternehmerForm.controls.id.value).toBe('unternehmer-neu');
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
    component.unternehmerForm.controls.id.setValue('unternehmer-1');
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
      '.pur-page-section__summary',
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
