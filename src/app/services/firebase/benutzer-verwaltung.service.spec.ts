// pur-office/src/app/services/firebase/benutzer-verwaltung.service.spec.ts

import { assertInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Functions } from '@angular/fire/functions';

import { IBenutzerAnlage } from '../../commons/models/domain/benutzer';
import { HTTPS_CALLABLE } from '../../commons/tokens/firebase.tokens';
import { BenutzerVerwaltungService } from './benutzer-verwaltung.service';

describe('BenutzerVerwaltungService', () => {
  const functionsMock = {} as Functions;
  const anlage: IBenutzerAnlage = {
    email: 'user@example.com',
    anzeigename: 'Test Benutzer',
    userRole: 'office',
    erlaubteBereiche: ['dashboard'],
    zugriffe: {},
    passwort: 'SicheresPasswort123!',
  };
  let callableMock: ReturnType<typeof vi.fn>;
  let httpsCallableMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callableMock = vi.fn().mockImplementation(() => {
      assertInInjectionContext(BenutzerVerwaltungService);

      return Promise.resolve({
        data: {
          uid: 'neu-123',
          email: anlage.email,
        },
      });
    });
    httpsCallableMock = vi.fn().mockImplementation(() => {
      assertInInjectionContext(BenutzerVerwaltungService);

      return callableMock;
    });
    TestBed.configureTestingModule({
      providers: [
        BenutzerVerwaltungService,
        { provide: Functions, useValue: functionsMock },
        { provide: HTTPS_CALLABLE, useValue: httpsCallableMock },
      ],
    });
  });

  it('should call the server-side user creation function', async () => {
    const service = TestBed.inject(BenutzerVerwaltungService);

    await expect(service.createBenutzer(anlage)).resolves.toEqual({
      uid: 'neu-123',
      email: anlage.email,
    });
    expect(httpsCallableMock).toHaveBeenCalledWith(functionsMock, 'createBenutzer');
    expect(callableMock).toHaveBeenCalledWith(anlage);
  });

  it('should pass callable errors to the store', async () => {
    const error = { code: 'functions/already-exists' };
    callableMock.mockRejectedValue(error);
    const service = TestBed.inject(BenutzerVerwaltungService);

    await expect(service.createBenutzer(anlage)).rejects.toBe(error);
  });
});
