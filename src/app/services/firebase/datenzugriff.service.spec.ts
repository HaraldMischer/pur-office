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
    for (const [field, load, path] of [
      ['customerName', () => service.loadUnternehmer(), ['unternehmer']],
      ['companyName', () => service.loadFirmen('u'), ['unternehmer', 'u', 'firma']],
      [
        'branchName',
        () => service.loadFilialen('u', 'f'),
        ['unternehmer', 'u', 'firma', 'f', 'filiale'],
      ],
    ] as const) {
      getDocs.mockResolvedValue({
        docs: [
          { id: 'b', data: () => ({ [field]: ' Beta ', company_ID: 'wrong' }) },
          { id: 'a', data: () => ({ [field]: 'Alpha' }) },
          { id: 'z', data: () => ({ [field]: 42 }) },
        ],
      });
      expect(await load()).toEqual([
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
        { id: 'z', name: 'z' },
      ]);
      expect(collection).toHaveBeenLastCalledWith(TestBed.inject(Firestore), ...path);
      expect(getDocs).toHaveBeenLastCalledWith('ref');
    }
  });
  it('should return an empty list and propagate read errors', async () => {
    const service = TestBed.inject(DatenzugriffService);
    getDocs.mockResolvedValue({ docs: [] });
    expect(await service.loadUnternehmer()).toEqual([]);
    getDocs.mockRejectedValue({ code: 'permission-denied' });
    await expect(service.loadUnternehmer()).rejects.toEqual({ code: 'permission-denied' });
  });
});
