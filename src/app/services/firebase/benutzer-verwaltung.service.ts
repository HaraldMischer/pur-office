// pur-office/src/app/services/firebase/benutzer-verwaltung.service.ts

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Functions } from '@angular/fire/functions';

import { IBenutzerAnlage, IBenutzerAnlageErgebnis } from '../../commons/models/domain/benutzer';
import { HTTPS_CALLABLE } from '../../commons/tokens/firebase.tokens';
import { LoadingService } from '../core/loading.service';
import { NetzwerkStatusService } from '../core/netzwerk-status.service';

@Injectable({ providedIn: 'root' })
export class BenutzerVerwaltungService {
  private readonly _injector = inject(Injector);
  private readonly _functions = inject(Functions);
  private readonly _httpsCallable = inject(HTTPS_CALLABLE);
  private readonly _loadingService = inject(LoadingService);
  private readonly _netzwerkStatusService = inject(NetzwerkStatusService);

  async createBenutzer(anlage: IBenutzerAnlage): Promise<IBenutzerAnlageErgebnis> {
    this._netzwerkStatusService.assertOnline();

    return this._loadingService.trackWrite(async () => {
      const result = await runInInjectionContext(this._injector, () => {
        const createBenutzer = this._httpsCallable<IBenutzerAnlage, IBenutzerAnlageErgebnis>(
          this._functions,
          'createBenutzer',
        );

        return createBenutzer(anlage);
      });

      return result.data;
    });
  }
}
