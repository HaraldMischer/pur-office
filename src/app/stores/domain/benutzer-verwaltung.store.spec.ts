// pur-office/src/app/stores/domain/benutzer-verwaltung.store.spec.ts

import { TestBed } from '@angular/core/testing';

import { IBenutzerAnlage } from '../../commons/models/domain/benutzer';
import { BenutzerVerwaltungService } from '../../services/firebase/benutzer-verwaltung.service';
import { BenutzerVerwaltungStore } from './benutzer-verwaltung.store';

describe('BenutzerVerwaltungStore', () => {
  const anlage: IBenutzerAnlage = {
    email: 'user@example.com',
    anzeigename: 'Test Benutzer',
    userRole: 'office',
    erlaubteBereiche: ['dashboard'],
    zugriffe: [],
    passwort: 'SicheresPasswort123!',
  };
  let serviceMock: { createBenutzer: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    serviceMock = {
      createBenutzer: vi.fn().mockResolvedValue({
        uid: 'neu-123',
        email: anlage.email,
      }),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: BenutzerVerwaltungService, useValue: serviceMock }],
    });
  });

  it('should create a user and expose the result', async () => {
    const store = TestBed.inject(BenutzerVerwaltungStore);

    await expect(store.createBenutzer(anlage)).resolves.toEqual({
      uid: 'neu-123',
      email: anlage.email,
    });
    expect(serviceMock.createBenutzer).toHaveBeenCalledWith(anlage);
    expect(store.createdBenutzer()).toEqual({
      uid: 'neu-123',
      email: anlage.email,
    });
    expect(store.inProgress()).toBe(false);
  });

  it('should expose a friendly callable error', async () => {
    const error = { code: 'functions/already-exists' };
    serviceMock.createBenutzer.mockRejectedValue(error);
    const store = TestBed.inject(BenutzerVerwaltungStore);

    await expect(store.createBenutzer(anlage)).rejects.toBe(error);
    expect(store.error()).toBe('Zu dieser E-Mail-Adresse besteht bereits ein Benutzerkonto.');
    expect(store.createdBenutzer()).toBeNull();
    expect(store.inProgress()).toBe(false);
  });
});
