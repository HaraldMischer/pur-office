// pur-office/src/app/services/core/loading.service.spec.ts

import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should show loading until all parallel operations are complete', async () => {
    const service = TestBed.inject(LoadingService);
    let resolveFirst!: (value: string) => void;
    let resolveSecond!: (value: string) => void;
    const first = service.trackLoad(
      () =>
        new Promise<string>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const second = service.trackLoad(
      () =>
        new Promise<string>((resolve) => {
          resolveSecond = resolve;
        }),
    );

    expect(service.isLoading()).toBe(true);
    resolveFirst('eins');
    await first;
    expect(service.isLoading()).toBe(true);
    resolveSecond('zwei');
    await second;
    expect(service.isLoading()).toBe(false);
  });

  it('should clear loading after an operation fails', async () => {
    const service = TestBed.inject(LoadingService);
    const error = new Error('Laden fehlgeschlagen');

    await expect(
      service.trackLoad(async () => {
        throw error;
      }),
    ).rejects.toBe(error);

    expect(service.isLoading()).toBe(false);
  });
});
