// pur-office/src/app/services/firebase/datenzugriff.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { FIRESTORE_COLLECTION, FIRESTORE_GET_DOCS } from '../../commons/tokens/firebase.tokens';
import { DatenzugriffService } from './datenzugriff.service';

describe('DatenzugriffService', () => {
  const collection = vi.fn().mockReturnValue('ref');
  const getDocs = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: FIRESTORE_COLLECTION, useValue: collection },
        { provide: FIRESTORE_GET_DOCS, useValue: getDocs },
      ],
    });
  });
  it('should use document IDs, map names and sort each level', async () => {
    const service = TestBed.inject(DatenzugriffService);
    for (const [field, load, path, mitNummer] of [
      ['name', () => service.loadUnternehmer(), ['unternehmer'], true],
      ['companyName', () => service.loadFirmen('u'), ['unternehmer', 'u', 'firma'], false],
      [
        'branchName',
        () => service.loadFilialen('u', 'f'),
        ['unternehmer', 'u', 'firma', 'f', 'filiale'],
        false,
      ],
    ] as const) {
      getDocs.mockResolvedValue({
        docs: [
          { id: 'b', data: () => ({ [field]: ' Beta ', nummer: 2, company_ID: 'wrong' }) },
          { id: 'a', data: () => ({ [field]: 'Alpha', nummer: 1 }) },
          { id: 'z', data: () => ({ [field]: 42 }) },
        ],
      });
      const nummern = mitNummer ? [{ nummer: 1 }, { nummer: 2 }, { nummer: 0 }] : [{}, {}, {}];
      expect(await load()).toEqual([
        { id: 'a', name: 'Alpha', ...nummern[0] },
        { id: 'b', name: 'Beta', ...nummern[1] },
        { id: 'z', name: 'z', ...nummern[2] },
      ]);
      expect(collection).toHaveBeenLastCalledWith(TestBed.inject(Firestore), ...path);
      expect(getDocs).toHaveBeenLastCalledWith('ref');
    }
  });
  it('should not use legacy customer names for the new entrepreneur collection', async () => {
    const service = TestBed.inject(DatenzugriffService);
    getDocs.mockResolvedValue({
      docs: [
        {
          id: 'neu',
          data: () => ({ name: 'Neuer Unternehmer', nummer: 7, customerName: 'Alt' }),
        },
        { id: 'ohne-name', data: () => ({ customerName: 'Alter Name' }) },
      ],
    });

    expect(await service.loadUnternehmer()).toEqual([
      { id: 'neu', name: 'Neuer Unternehmer', nummer: 7 },
      { id: 'ohne-name', name: 'ohne-name', nummer: 0 },
    ]);
  });
  it('should return an empty list and propagate read errors', async () => {
    const service = TestBed.inject(DatenzugriffService);
    getDocs.mockResolvedValue({ docs: [] });
    expect(await service.loadUnternehmer()).toEqual([]);
    getDocs.mockRejectedValue({ code: 'permission-denied' });
    await expect(service.loadUnternehmer()).rejects.toEqual({ code: 'permission-denied' });
  });
});
