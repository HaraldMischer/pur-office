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
    benutzerProfil: ReturnType<typeof vi.fn>;
    darfBereichNutzen: ReturnType<typeof vi.fn>;
    istMaster: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    benutzerStoreMock = {
      benutzerProfil: vi.fn().mockReturnValue(null),
      darfBereichNutzen: vi.fn((bereich: TAppBereich) =>
        ['dashboard', 'schichtplan', 'mitarbeiter', 'verwaltung', 'systemverwaltung'].includes(
          bereich,
        ),
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
          { path: 'systemverwaltung', component: AppSidenavHost },
          { path: 'passwort', component: AppSidenavHost },
        ]),
        { provide: BenutzerStore, useValue: benutzerStoreMock },
      ],
    }).compileComponents();
  });

  it('should render the configured product title', () => {
    const fixture = TestBed.createComponent(AppSidenavHost);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-brand-toolbar')?.textContent).toContain('Pur-System');
  });

  it('should show the account name and login name', () => {
    benutzerStoreMock.benutzerProfil.mockReturnValue({
      anzeigename: 'Pur System Master',
      anmeldename: 'pur-system-master',
      email: 'pur-system-master@example.com',
    });
    const fixture = TestBed.createComponent(AppSidenavHost);
    fixture.detectChanges();
    const card = (fixture.nativeElement as HTMLElement).querySelector('.pur-card--user');

    expect(card?.textContent).toContain('Pur System Master');
    expect(card?.querySelector('small')?.textContent).toBe('pur-system-master');
    expect(card?.textContent).not.toContain('pur-system-master@example.com');
  });

  it('should show the fallback without a profile', () => {
    const fixture = TestBed.createComponent(AppSidenavHost);
    fixture.detectChanges();
    const card = (fixture.nativeElement as HTMLElement).querySelector('.pur-card--user');

    expect(card?.textContent).toContain('Nicht angemeldet');
    expect(card?.querySelector('small')).toBeNull();
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
    expect(navigationText).toContain('Systemverwaltung');
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
    expect(navigationText).not.toContain('Verwaltung');
  });

  it('should hide administration from users without the master role', () => {
    benutzerStoreMock.istMaster.mockReturnValue(false);
    const fixture = TestBed.createComponent(AppSidenavHost);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navigationText = compiled.querySelector('mat-nav-list')?.textContent;

    expect(navigationText).toContain('Dashboard');
    expect(navigationText).toContain('Verwaltung');
    expect(navigationText).not.toContain('Systemverwaltung');
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
