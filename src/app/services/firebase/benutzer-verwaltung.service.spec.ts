// pur-office/src/app/services/firebase/benutzer-verwaltung.service.spec.ts

import { assertInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Functions } from '@angular/fire/functions';

import { IBenutzerAnlage } from '../../commons/models/domain/benutzer';
import { HTTPS_CALLABLE } from '../../commons/tokens/firebase.tokens';
import { LoadingService } from '../core/loading.service';
import { NetzwerkStatusService } from '../core/netzwerk-status.service';
import { BenutzerVerwaltungService } from './benutzer-verwaltung.service';

describe('BenutzerVerwaltungService', () => {
  const functionsMock = {} as Functions;
  const anlage: IBenutzerAnlage = {
    namensbestandteil: 'testbenutzer',
    anzeigename: 'Test Benutzer',
    userRole: 'office',
    erlaubteBereiche: ['dashboard'],
    zugriffe: {},
    passwort: 'SicheresPasswort123!',
  };
  let callableMock: ReturnType<typeof vi.fn>;
  let httpsCallableMock: ReturnType<typeof vi.fn>;
  let trackWriteMock: ReturnType<typeof vi.fn>;
  let assertOnlineMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callableMock = vi.fn().mockImplementation(() => {
      assertInInjectionContext(BenutzerVerwaltungService);

      return Promise.resolve({
        data: {
          uid: 'neu-123',
          anmeldename: 'testbenutzer-office',
          email: 'testbenutzer-office@pur-system.invalid',
        },
      });
    });
    httpsCallableMock = vi.fn().mockImplementation(() => {
      assertInInjectionContext(BenutzerVerwaltungService);

      return callableMock;
    });
    trackWriteMock = vi.fn().mockImplementation(async (aktion: () => Promise<unknown>) => {
      return aktion();
    });
    assertOnlineMock = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        BenutzerVerwaltungService,
        { provide: Functions, useValue: functionsMock },
        { provide: HTTPS_CALLABLE, useValue: httpsCallableMock },
        { provide: LoadingService, useValue: { trackWrite: trackWriteMock } },
        { provide: NetzwerkStatusService, useValue: { assertOnline: assertOnlineMock } },
      ],
    });
  });

  it('should call the server-side user creation function', async () => {
    const service = TestBed.inject(BenutzerVerwaltungService);

    await expect(service.createBenutzer(anlage)).resolves.toEqual({
      uid: 'neu-123',
      anmeldename: 'testbenutzer-office',
      email: 'testbenutzer-office@pur-system.invalid',
    });
    expect(assertOnlineMock).toHaveBeenCalledOnce();
    expect(trackWriteMock).toHaveBeenCalledWith(expect.any(Function));
    expect(httpsCallableMock).toHaveBeenCalledWith(functionsMock, 'createBenutzer');
    expect(callableMock).toHaveBeenCalledWith(anlage);
  });

  it('should pass callable errors to the store', async () => {
    const error = { code: 'functions/already-exists' };
    callableMock.mockRejectedValue(error);
    const service = TestBed.inject(BenutzerVerwaltungService);

    await expect(service.createBenutzer(anlage)).rejects.toBe(error);
  });

  it('should reject user creation before calling the function while offline', async () => {
    const error = { code: 'app/offline' };
    assertOnlineMock.mockImplementation(() => {
      throw error;
    });
    const service = TestBed.inject(BenutzerVerwaltungService);

    await expect(service.createBenutzer(anlage)).rejects.toBe(error);
    expect(httpsCallableMock).not.toHaveBeenCalled();
    expect(callableMock).not.toHaveBeenCalled();
    expect(trackWriteMock).not.toHaveBeenCalled();
  });
});
