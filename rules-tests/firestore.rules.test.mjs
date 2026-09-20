// pur-office/rules-tests/firestore.rules.test.mjs

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  documentId,
  query,
  where,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: 'demo-pur-office',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
});

after(async () => {
  await testEnvironment.cleanup();
});

test('keeps authenticated access to legacy collections and subcollections', async () => {
  const firestore = testEnvironment.authenticatedContext('legacy-user').firestore();
  const customer = doc(firestore, 'purCustomers/customer-1');
  const machine = doc(firestore, 'purCustomers/customer-1/machines/machine-1');

  await assertSucceeds(setDoc(customer, { name: 'Customer' }));
  await assertSucceeds(getDoc(customer));
  await assertSucceeds(setDoc(machine, { name: 'Machine' }));
  await assertSucceeds(deleteDoc(machine));
});

test('continues to reject unauthenticated access to legacy collections', async () => {
  const firestore = testEnvironment.unauthenticatedContext().firestore();

  await assertFails(getDoc(doc(firestore, 'purCustomers/customer-1')));
  await assertFails(setDoc(doc(firestore, 'purUser/user-1'), { active: true }));
});

test('allows a user to read only the own Pur Office profile', async () => {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'benutzer/user-1'), { uid: 'user-1' });
    await setDoc(doc(context.firestore(), 'benutzer/user-2'), { uid: 'user-2' });
  });

  const firestore = testEnvironment.authenticatedContext('user-1').firestore();
  const ownProfile = await assertSucceeds(getDoc(doc(firestore, 'benutzer/user-1')));

  assert.equal(ownProfile.data()?.['uid'], 'user-1');
  await assertFails(getDoc(doc(firestore, 'benutzer/user-2')));
  await assertFails(getDocs(collection(firestore, 'benutzer')));
});

test('rejects all client writes to Pur Office profiles', async () => {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'benutzer/user-1'), {
      uid: 'user-1',
      userRole: 'filiale',
    });
  });

  const firestore = testEnvironment.authenticatedContext('user-1').firestore();

  await assertFails(
    setDoc(doc(firestore, 'benutzer/user-1'), { userRole: 'master' }, { merge: true }),
  );
  await assertFails(setDoc(doc(firestore, 'benutzer/new-user'), { uid: 'new-user' }));
  await assertFails(deleteDoc(doc(firestore, 'benutzer/user-1')));
});

const zugriffe = { 'u-1': { 'f-1': ['b-1'] } };
const unternehmerPath = 'unternehmer/u-1';
const firmaPath = `${unternehmerPath}/firma/f-1`;
const filialePath = `${firmaPath}/filiale/b-1`;
const legacyBranchPath = 'purCustomers/u-1/company/f-1/branches/b-1';

async function seedProfile(userRole, overrides = {}) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'benutzer/scoped'), {
      aktiv: true,
      userRole,
      zugriffe,
      ...overrides,
    });
    for (const path of [
      unternehmerPath,
      firmaPath,
      filialePath,
      `${filialePath}/mitarbeiter/m-1`,
      `${firmaPath}/filiale/b-2`,
      'unternehmer/u-2/firma/f-1/filiale/b-1',
      legacyBranchPath,
      'purUser/old',
      'other/doc',
      'benutzer/other',
      'benutzer/other/private/doc',
    ]) {
      await setDoc(doc(db, path), { name: path });
    }
  });
  return testEnvironment.authenticatedContext('scoped').firestore();
}

test('active master reads all collections, nested data and all profiles with legacy scopes', async () => {
  const db = await seedProfile('master', { zugriffe: [] });
  for (const path of [
    filialePath,
    `${filialePath}/mitarbeiter/m-1`,
    legacyBranchPath,
    'purUser/old',
    'other/doc',
    'benutzer/other',
    'benutzer/other/private/doc',
  ]) {
    await assertSucceeds(getDoc(doc(db, path)));
  }
  for (const path of [
    'benutzer',
    'unternehmer',
    'purCustomers',
    'purUser',
    `${firmaPath}/filiale`,
  ]) {
    await assertSucceeds(getDocs(collection(db, path)));
  }
});

for (const role of ['office', 'filiale']) {
  test(`${role} reads only assigned hierarchy, including branch descendants`, async () => {
    const db = await seedProfile(role);
    for (const path of [
      unternehmerPath,
      firmaPath,
      filialePath,
      `${filialePath}/mitarbeiter/m-1`,
    ]) {
      await assertSucceeds(getDoc(doc(db, path)));
    }
    await assertSucceeds(getDocs(collection(db, `${filialePath}/mitarbeiter`)));
    await assertSucceeds(getDoc(doc(db, 'benutzer/scoped')));
    for (const path of [
      `${firmaPath}/filiale/b-2`,
      'unternehmer/u-2',
      'unternehmer/u-2/firma/f-1/filiale/b-1',
      'unternehmer/u-1/firma/f-2',
      `${firmaPath}/private/doc`,
      `${unternehmerPath}/private/doc`,
      legacyBranchPath,
      'purUser/old',
      'other/doc',
      'benutzer/other',
      'benutzer/other/private/doc',
    ]) {
      await assertFails(getDoc(doc(db, path)));
    }
    await assertFails(getDocs(collection(db, 'benutzer')));
    await assertFails(getDocs(collection(db, 'unternehmer')));
    await assertFails(getDocs(collection(db, `${firmaPath}/filiale`)));
  });

  test(`${role} has no business access with empty scopes`, async () => {
    const db = await seedProfile(role, { zugriffe: {} });
    for (const path of [unternehmerPath, firmaPath, filialePath]) {
      await assertFails(getDoc(doc(db, path)));
    }
  });
}

for (const role of ['master', 'office', 'filiale']) {
  test(`inactive ${role} reads own profile only`, async () => {
    const db = await seedProfile(role, { aktiv: false });
    await assertSucceeds(getDoc(doc(db, 'benutzer/scoped')));
    for (const path of [filialePath, 'purUser/old', 'benutzer/other']) {
      await assertFails(getDoc(doc(db, path)));
    }
  });

  test(`${role} cannot write business data, own profile or other profiles`, async () => {
    const db = await seedProfile(role);
    for (const path of [
      filialePath,
      'purUser/old',
      'other/doc',
      'benutzer/scoped',
      'benutzer/other',
    ]) {
      await assertFails(setDoc(doc(db, path), { aktiv: true }, { merge: true }));
      await assertFails(deleteDoc(doc(db, path)));
    }
    await assertFails(setDoc(doc(db, `${filialePath}/mitarbeiter/new`), { name: 'new' }));
  });
}

test('legacy array scopes and unknown roles fail closed', async () => {
  let db = await seedProfile('office', {
    zugriffe: [{ unternehmerId: 'u-1', firmaId: 'f-1', filialIds: ['b-1'] }],
  });
  await assertFails(getDoc(doc(db, filialePath)));
  db = await seedProfile('unknown');
  await assertFails(getDoc(doc(db, filialePath)));
});

test('malformed nested access values fail closed', async () => {
  const db = await seedProfile('office', {
    zugriffe: { 'u-1': ['f-1'] },
  });
  for (const path of [unternehmerPath, firmaPath, filialePath]) {
    await assertFails(getDoc(doc(db, path)));
  }
});

test('empty branch lists grant neither company nor branch access', async () => {
  const db = await seedProfile('office', { zugriffe: { 'u-1': { 'f-1': [] } } });
  await assertSucceeds(getDoc(doc(db, unternehmerPath)));
  await assertFails(getDoc(doc(db, firmaPath)));
  await assertFails(getDoc(doc(db, filialePath)));
});

test('legacy users retain old access but cannot access the new hierarchy', async () => {
  const db = testEnvironment.authenticatedContext('legacy').firestore();
  for (const path of [
    'purUser/old',
    legacyBranchPath,
    `${legacyBranchPath}/employee/e-1`,
    'other/doc',
  ]) {
    await assertSucceeds(setDoc(doc(db, path), { value: 1 }));
    await assertSucceeds(setDoc(doc(db, path), { value: 2 }, { merge: true }));
    await assertSucceeds(getDoc(doc(db, path)));
    await assertSucceeds(deleteDoc(doc(db, path)));
  }
  await assertSucceeds(getDocs(collection(db, 'purCustomers')));
  await assertFails(getDoc(doc(db, unternehmerPath)));
  await assertFails(setDoc(doc(db, filialePath), { value: 1 }));
  await assertFails(getDocs(collection(db, 'unternehmer')));
  await assertFails(setDoc(doc(db, 'benutzer/legacy'), { userRole: 'master' }));
  await assertFails(getDoc(doc(db, 'benutzer/other')));
});

test('scoped queries explicitly restricted to assigned document IDs succeed', async () => {
  const db = await seedProfile('office');
  for (const [path, id] of [
    ['unternehmer', 'u-1'],
    [`${unternehmerPath}/firma`, 'f-1'],
    [`${firmaPath}/filiale`, 'b-1'],
  ]) {
    const result = await assertSucceeds(
      getDocs(query(collection(db, path), where(documentId(), 'in', [id]))),
    );
    assert.equal(result.size, 1);
  }
});

test('multiple entrepreneurs and companies remain accessible beyond the first scope', async () => {
  const mehrereZugriffe = Object.fromEntries(
    Array.from({ length: 15 }, (_, i) => [`u-${i}`, { 'f-1': ['b-1'] }]),
  );
  const db = await seedProfile('office', { zugriffe: mehrereZugriffe });
  await assertSucceeds(getDoc(doc(db, 'unternehmer/u-14/firma/f-1/filiale/b-1')));
  await assertFails(getDoc(doc(db, 'unternehmer/u-14/firma/f-1/filiale/b-2')));
});
