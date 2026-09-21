// pur-office/src/app/services/core/store-debug.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { StoreDebugService } from './store-debug.service';

describe('StoreDebugService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log registered store snapshots and remove inactive instances', () => {
    const snapshot = { isLoaded: true };
    const snapshotProvider = vi.fn().mockReturnValue(snapshot);
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [StoreDebugService],
    });
    const service = TestBed.inject(StoreDebugService);
    const unregister = service.registerStoreSnapshot('UnternehmerStore', snapshotProvider);

    service.logStoreSnapshots();

    expect(snapshotProvider).toHaveBeenCalledOnce();
    expect(consoleLogSpy).toHaveBeenCalledWith('[Store-Snapshots]', {
      UnternehmerStore: snapshot,
    });

    unregister();
    service.logStoreSnapshots();

    expect(consoleLogSpy).toHaveBeenLastCalledWith('[Store-Snapshots]', {});
  });
});
