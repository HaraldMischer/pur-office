// pur-office/src/app/components/app-shell/app-sidenav/app-sidenav.spec.ts

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TAppBereich } from '../../../commons/models/app/app-bereich';
import { BenutzerStore } from '../../../stores/app/benutzer.store';
import { AppSidenav } from './app-sidenav';

@Component({
  imports: [AppSidenav],
  template: '<app-sidenav [isHandset]="isHandset" />',
})
class AppSidenavHost {
  isHandset = false;
}

describe('AppSidenav', () => {
  let benutzerStoreMock: {
    darfBereichNutzen: ReturnType<typeof vi.fn>;
    istMaster: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    benutzerStoreMock = {
      darfBereichNutzen: vi.fn((bereich: TAppBereich) =>
        ['dashboard', 'schichtplan', 'mitarbeiter', 'verwaltung'].includes(bereich),
      ),
      istMaster: vi.fn().mockReturnValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [AppSidenavHost],
      providers: [
        provideRouter([
          { path: 'dashboard', component: AppSidenavHost },
          { path: 'schichtplan', component: AppSidenavHost },
          { path: 'mitarbeiter', component: AppSidenavHost },
          { path: 'verwaltung', component: AppSidenavHost },
        ]),
        { provide: BenutzerStore, useValue: benutzerStoreMock },
      ],
    }).compileComponents();
  });

  it('should render the app title', () => {
    const fixture = TestBed.createComponent(AppSidenavHost);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-brand-toolbar')?.textContent).toContain('Pur Office');
  });

  it('should render the allowed main navigation', () => {
    const fixture = TestBed.createComponent(AppSidenavHost);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navigationText = compiled.querySelector('mat-nav-list')?.textContent;

    expect(navigationText).toContain('Dashboard');
    expect(navigationText).toContain('Schichtplan');
    expect(navigationText).toContain('Mitarbeiter');
    expect(navigationText).toContain('Verwaltung');
  });

  it('should hide navigation entries without permission', () => {
    benutzerStoreMock.darfBereichNutzen.mockImplementation((bereich: TAppBereich) =>
      ['dashboard'].includes(bereich),
    );
    const fixture = TestBed.createComponent(AppSidenavHost);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navigationText = compiled.querySelector('mat-nav-list')?.textContent;

    expect(navigationText).toContain('Dashboard');
    expect(navigationText).not.toContain('Schichtplan');
    expect(navigationText).not.toContain('Mitarbeiter');
  });

  it('should hide administration from users without the master role', () => {
    benutzerStoreMock.istMaster.mockReturnValue(false);
    const fixture = TestBed.createComponent(AppSidenavHost);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navigationText = compiled.querySelector('mat-nav-list')?.textContent;

    expect(navigationText).toContain('Dashboard');
    expect(navigationText).not.toContain('Verwaltung');
  });

  it('should emit a navigation selection on handset', () => {
    const fixture = TestBed.createComponent(AppSidenavHost);
    fixture.componentInstance.isHandset = true;
    fixture.detectChanges();
    const sidenav = fixture.debugElement.children[0].componentInstance as AppSidenav;
    const navigationSelectedSpy = vi.fn();
    sidenav.navigationSelected.subscribe(navigationSelectedSpy);
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLAnchorElement>('a[mat-list-item]')?.click();

    expect(navigationSelectedSpy).toHaveBeenCalledOnce();
  });
});
