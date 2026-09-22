// pur-office/src/app/pages/verwaltung-page/verwaltung-page.spec.ts

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { VerwaltungStore } from '../../stores/domain/verwaltung.store';
import { VerwaltungPage } from './verwaltung-page';

describe('VerwaltungPage', () => {
  const verwaltungStoreMock = {
    unternehmerListe: signal({ daten: [], download: false, isLoaded: true, error: null }),
    firmenListe: signal({ daten: [], download: false, isLoaded: false, error: null }),
    filialenListe: signal({ daten: [], download: false, isLoaded: false, error: null }),
    unternehmer: signal([]),
    firmen: signal([]),
    filialen: signal([]),
    selectedUnternehmerId: signal(null),
    selectedFirmaId: signal(null),
    selectedFilialeId: signal(null),
    loadUnternehmer: vi.fn().mockResolvedValue(undefined),
    loadFirmen: vi.fn().mockResolvedValue(undefined),
    loadFilialen: vi.fn().mockResolvedValue(undefined),
    selectUnternehmer: vi.fn().mockResolvedValue(undefined),
    selectFirma: vi.fn().mockResolvedValue(undefined),
    selectFiliale: vi.fn(),
  };

  it('should render the administration placeholder', async () => {
    await TestBed.configureTestingModule({
      imports: [VerwaltungPage, NoopAnimationsModule],
    })
      .overrideComponent(VerwaltungPage, {
        set: {
          providers: [{ provide: VerwaltungStore, useValue: verwaltungStoreMock }],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(VerwaltungPage);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pur-page-section__title')?.textContent).toContain(
      'Firmen und Filialen verwalten',
    );
    expect(compiled.querySelectorAll('mat-select')).toHaveLength(3);
    expect(compiled.textContent).toContain('Dem Benutzer sind keine Unternehmer zugeordnet.');
    expect(verwaltungStoreMock.loadUnternehmer).toHaveBeenCalledOnce();
  });
});
